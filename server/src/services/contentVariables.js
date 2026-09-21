
const HOME_SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Variables que las paginas institucionales pueden usar en su contenido con
 * la sintaxis {{nombre}}.
 *
 * TiendaKit es white-label: los datos del comercio no se escriben a mano en el
 * texto de cada pagina, porque entonces cada cliente tendria que editar ocho
 * paginas para cambiar un telefono. Se cargan una sola vez desde el panel y
 * estas variables los resuelven en todas las paginas a la vez.
 *
 * Cada entrada declara de donde sale el valor y como se llama en el panel,
 * para poder mostrarle al comercio que le falta completar.
 */
const VARIABLES = {
  nombreTienda:       { label: 'Nombre de la tienda',  origen: 'Configuración > General' },
  razonSocial:        { label: 'Razón social',         origen: 'Datos del comercio' },
  cuit:               { label: 'CUIT',                 origen: 'Datos del comercio' },
  condicionFiscal:    { label: 'Condición fiscal',     origen: 'Datos del comercio' },
  domicilioComercial: { label: 'Domicilio comercial',  origen: 'Datos del comercio' },
  jurisdiccion:       { label: 'Jurisdicción',         origen: 'Datos del comercio' },
  email:              { label: 'Email de contacto',    origen: 'Personalizar > Footer' },
  telefono:           { label: 'Teléfono',             origen: 'Personalizar > Footer' },
  horario:            { label: 'Horario de atención',  origen: 'Personalizar > Footer' }
};

/** Lo que se muestra cuando el comercio todavia no cargo el dato. */
const SIN_COMPLETAR = '—';

/**
 * Arma el diccionario de valores a partir de la configuracion de la tienda.
 * Devuelve tambien que variables quedaron sin completar, para poder avisarle
 * al comercio desde el panel.
 */
const getContentVariables = async () => {
  // Require diferido: mantiene este modulo importable sin base de datos,
  // para poder testear el reemplazo de variables de forma aislada.
  const { HomeSettings, Setting } = require('../models');

  const settings = await HomeSettings.findByPk(HOME_SETTINGS_ID);
  const siteName = await Setting.findOne({ where: { key: 'site_name' } });

  const valores = {
    nombreTienda:       siteName?.value || '',
    razonSocial:        settings?.legalBusinessName || '',
    cuit:               settings?.legalCuit || '',
    condicionFiscal:    settings?.legalTaxCategory || '',
    domicilioComercial: settings?.legalAddress || '',
    jurisdiccion:       settings?.legalJurisdiction || '',
    email:              settings?.footerEmail || '',
    telefono:           settings?.footerPhone || '',
    horario:            settings?.footerSchedule || ''
  };

  const faltantes = Object.entries(valores)
    .filter(([, v]) => !String(v).trim())
    .map(([k]) => ({ key: k, ...VARIABLES[k] }));

  return { valores, faltantes };
};

/**
 * Reemplaza {{variable}} por su valor. Las variables sin completar se
 * muestran como una raya en vez de dejar el {{token}} a la vista del cliente.
 * Una variable desconocida se deja intacta: probablemente sea texto del
 * comercio, no un error nuestro.
 */
const replaceContentVariables = (content, valores) => {
  if (!content) return content;

  return content.replace(/\{\{\s*(\w+)\s*\}\}/g, (original, nombre) => {
    if (!(nombre in valores)) return original;
    const valor = String(valores[nombre]).trim();
    return valor || SIN_COMPLETAR;
  });
};

module.exports = {
  VARIABLES,
  SIN_COMPLETAR,
  getContentVariables,
  replaceContentVariables
};
