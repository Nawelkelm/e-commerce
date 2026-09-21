const { Op } = require('sequelize');
const logger = require('../config/logger');

// Requires diferidos: models y afipService abren la conexion a la base al
// cargarse, y este modulo tiene logica pura que conviene poder testear sola.
const getInvoice = () => require('../models').Invoice;
const getAfipService = () => require('./afipService');

/**
 * Sincronizacion de comprobantes emitidos desde ARCA.
 *
 * ARCA no expone ningun metodo que devuelva "todos mis comprobantes": el web
 * service wsfe solo permite pedir el ultimo numero autorizado
 * (FECompUltimoAutorizado) y consultar un comprobante puntual
 * (FECompConsultar). Por eso la unica forma de traerlos es reconstruir la
 * serie: se pregunta hasta donde llego ARCA y se completan los numeros que
 * falten localmente.
 *
 * Como cada comprobante es una llamada, la sincronizacion es incremental (solo
 * el hueco) y esta acotada por corrida, para no chocar con los limites de
 * frecuencia de AFIP. En regimen normal el hueco es de unos pocos comprobantes
 * por dia; solo la primera carga es pesada y se completa en varias corridas.
 */

/** Comprobantes que se sincronizan, con su codigo de AFIP. */
const TIPOS = [
  { codigo: 1,  letra: 'A',   nombre: 'Factura A' },
  { codigo: 6,  letra: 'B',   nombre: 'Factura B' },
  { codigo: 11, letra: 'C',   nombre: 'Factura C' },
  { codigo: 2,  letra: 'NDA', nombre: 'Nota de Débito A' },
  { codigo: 7,  letra: 'NDB', nombre: 'Nota de Débito B' },
  { codigo: 12, letra: 'NDC', nombre: 'Nota de Débito C' },
  { codigo: 3,  letra: 'NCA', nombre: 'Nota de Crédito A' },
  { codigo: 8,  letra: 'NCB', nombre: 'Nota de Crédito B' },
  { codigo: 13, letra: 'NCC', nombre: 'Nota de Crédito C' }
];

/** Tope de comprobantes a traer por corrida, para no saturar a AFIP. */
const MAX_POR_CORRIDA = 150;

/** Pausa entre llamadas, en milisegundos. */
const ESPERA_ENTRE_LLAMADAS = 350;

const dormir = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Los comprobantes emitidos desde la tienda no siempre tienen
 * afipVoucherNumber cargado: los mas viejos solo guardan el numero dentro del
 * string invoiceNumber (formato "B-00001-00000123"). Se contempla ambos para
 * no reimportar algo que ya existe.
 */
const numeroDesdeInvoiceNumber = (invoiceNumber) => {
  if (!invoiceNumber) return null;
  const partes = String(invoiceNumber).split('-');
  if (partes.length < 3) return null;
  const n = parseInt(partes[partes.length - 1], 10);
  return Number.isNaN(n) ? null : n;
};

/** Numeros que ya tenemos localmente para un punto de venta y tipo. */
const numerosLocales = async (pointOfSale, tipo) => {
  const invoices = await getInvoice().findAll({
    where: {
      pointOfSale,
      [Op.or]: [
        { afipVoucherType: tipo.codigo },
        { invoiceType: tipo.letra }
      ]
    },
    attributes: ['id', 'invoiceNumber', 'afipVoucherNumber']
  });

  const numeros = new Set();
  for (const inv of invoices) {
    const n = inv.afipVoucherNumber || numeroDesdeInvoiceNumber(inv.invoiceNumber);
    if (n) numeros.add(n);
  }
  return numeros;
};

/** Fecha de AFIP ("20260921") a Date. */
const parsearFecha = (valor) => {
  if (!valor) return null;
  const s = String(valor);
  if (/^\d{8}$/.test(s)) {
    return new Date(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T00:00:00`);
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * Crea localmente un comprobante que existe en ARCA pero no en la tienda.
 * Queda marcado con origin 'arca': es un registro de solo lectura, sin pedido
 * asociado, que sirve para que el listado de facturacion refleje el total real
 * emitido (incluye lo cargado a mano en el portal o desde otro sistema).
 */
const importarComprobante = async (info, pointOfSale, tipo) => {
  const total = parseFloat(info.ImpTotal || 0);
  const neto = parseFloat(info.ImpNeto || 0);
  const iva = parseFloat(info.ImpIVA || 0);

  return getInvoice().create({
    invoiceNumber: getAfipService().formatInvoiceNumber(pointOfSale, tipo.letra, info.CbteDesde || info.CbteNro),
    origin: 'arca',
    invoiceType: tipo.letra,
    afipVoucherType: tipo.codigo,
    afipVoucherNumber: parseInt(info.CbteDesde || info.CbteNro, 10),
    pointOfSale,
    cae: info.CodAutorizacion || info.CAE || null,
    caeDueDate: parsearFecha(info.FchVto || info.CAEFchVto),
    afipStatus: 'authorized',
    afipResponse: info,
    issueDate: parsearFecha(info.CbteFch) || new Date(),
    customerName: 'Comprobante emitido fuera de la tienda',
    customerCuit: info.DocNro ? String(info.DocNro) : null,
    subtotal: neto || total,
    tax: iva,
    total,
    items: [],
    status: 'issued',
    arcaSyncedAt: new Date(),
    observations: 'Importado automáticamente desde ARCA. No tiene pedido asociado.'
  });
};

/**
 * Sincroniza un punto de venta y un tipo de comprobante.
 * Devuelve cuantos trajo y cuantos quedaron pendientes para la proxima corrida.
 */
const sincronizarSerie = async (pointOfSale, tipo, cupo) => {
  const resultado = {
    puntoVenta: pointOfSale,
    tipo: tipo.nombre,
    ultimoEnArca: 0,
    importados: 0,
    pendientes: 0,
    errores: 0
  };

  let ultimo;
  try {
    const r = await getAfipService().getLastInvoiceNumber(tipo.letra, pointOfSale);
    ultimo = r.lastNumber;
  } catch (error) {
    // Un tipo que la tienda no usa devuelve error o cero: no es una falla.
    logger.debug(`ARCA sync: sin datos para ${tipo.nombre} en PV ${pointOfSale}: ${error.message}`);
    return resultado;
  }

  resultado.ultimoEnArca = ultimo;
  if (!ultimo) return resultado;

  const yaTenemos = await numerosLocales(pointOfSale, tipo);

  // Se completan los huecos de mas nuevo a mas viejo: si la carga inicial se
  // corta, lo primero que aparece en el panel es lo mas reciente.
  const faltantes = [];
  for (let n = ultimo; n >= 1; n--) {
    if (!yaTenemos.has(n)) faltantes.push(n);
  }

  resultado.pendientes = Math.max(0, faltantes.length - cupo);

  for (const numero of faltantes.slice(0, cupo)) {
    try {
      const r = await getAfipService().getCAEInfo(pointOfSale, tipo.letra, numero);
      if (r.success && r.data) {
        await importarComprobante(r.data, pointOfSale, tipo);
        resultado.importados++;
      }
    } catch (error) {
      resultado.errores++;
      logger.warn(`ARCA sync: fallo el comprobante ${tipo.letra} ${pointOfSale}-${numero}: ${error.message}`);
    }
    await dormir(ESPERA_ENTRE_LLAMADAS);
  }

  return resultado;
};

/**
 * Corrida completa: recorre los puntos de venta habilitados y los tipos de
 * comprobante, repartiendo el cupo de la corrida entre todas las series.
 */
const syncFromArca = async ({ maxPorCorrida = MAX_POR_CORRIDA } = {}) => {
  const inicio = Date.now();

  await getAfipService().initialize();

  // Puntos de venta habilitados en ARCA. Si no se pueden listar, se usa el
  // configurado en la credencial.
  let puntosVenta = [];
  try {
    const puntos = await getAfipService().getSalesPoints();
    puntosVenta = (puntos || [])
      .filter(p => p.Bloqueado !== 'S')
      .map(p => parseInt(p.Nro, 10))
      .filter(Boolean);
  } catch (error) {
    logger.debug(`ARCA sync: no se pudieron listar los puntos de venta (${error.message})`);
  }

  if (!puntosVenta.length) {
    puntosVenta = [getAfipService().credential?.pointOfSale || 1];
  }

  const series = [];
  let cupo = maxPorCorrida;

  for (const pv of puntosVenta) {
    for (const tipo of TIPOS) {
      if (cupo <= 0) break;
      const r = await sincronizarSerie(pv, tipo, cupo);
      cupo -= r.importados;
      if (r.ultimoEnArca > 0) series.push(r);
    }
  }

  const resumen = {
    puntosVenta,
    series,
    importados: series.reduce((s, r) => s + r.importados, 0),
    pendientes: series.reduce((s, r) => s + r.pendientes, 0),
    errores: series.reduce((s, r) => s + r.errores, 0),
    duracionMs: Date.now() - inicio
  };

  logger.info(
    `ARCA sync: ${resumen.importados} importados, ${resumen.pendientes} pendientes, ` +
    `${resumen.errores} con error (${Math.round(resumen.duracionMs / 1000)}s)`
  );

  return resumen;
};

module.exports = {
  TIPOS,
  MAX_POR_CORRIDA,
  syncFromArca,
  // Exportados para poder testearlos de forma aislada.
  numeroDesdeInvoiceNumber,
  parsearFecha
};
