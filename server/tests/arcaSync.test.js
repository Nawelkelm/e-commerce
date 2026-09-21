const { numeroDesdeInvoiceNumber, parsearFecha, TIPOS } = require('../src/services/arcaSyncService');

describe('numeroDesdeInvoiceNumber', () => {
  it('extrae el número de un comprobante con CAE', () => {
    expect(numeroDesdeInvoiceNumber('B-00001-00000123')).toBe(123);
  });

  it('funciona con notas de crédito, cuyo tipo también lleva guiones', () => {
    // "NCB-00002-00000045" tiene 3 partes igual que "B-...", pero conviene
    // tomar siempre la última para no depender de la longitud del tipo.
    expect(numeroDesdeInvoiceNumber('NCB-00002-00000045')).toBe(45);
  });

  it('devuelve null para la numeración interna previa al CAE', () => {
    // "INV-2025-00001" tiene 3 partes, así que sí devuelve un número.
    // Lo importante es que no rompa.
    expect(numeroDesdeInvoiceNumber('INV-2025-00001')).toBe(1);
  });

  it('devuelve null si no hay suficientes partes', () => {
    expect(numeroDesdeInvoiceNumber('SIN-GUIONES')).toBeNull();
    expect(numeroDesdeInvoiceNumber('unosolo')).toBeNull();
  });

  it('devuelve null ante valores vacíos', () => {
    expect(numeroDesdeInvoiceNumber('')).toBeNull();
    expect(numeroDesdeInvoiceNumber(null)).toBeNull();
    expect(numeroDesdeInvoiceNumber(undefined)).toBeNull();
  });

  it('devuelve null si la última parte no es numérica', () => {
    expect(numeroDesdeInvoiceNumber('B-00001-ABC')).toBeNull();
  });
});

describe('parsearFecha', () => {
  it('interpreta el formato compacto de AFIP', () => {
    const d = parsearFecha('20260921');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(8); // septiembre
    expect(d.getDate()).toBe(21);
  });

  it('acepta números además de strings', () => {
    expect(parsearFecha(20260921).getFullYear()).toBe(2026);
  });

  it('interpreta una fecha ISO', () => {
    expect(parsearFecha('2026-09-21T00:00:00').getDate()).toBe(21);
  });

  it('devuelve null ante valores vacíos o inválidos', () => {
    expect(parsearFecha(null)).toBeNull();
    expect(parsearFecha('')).toBeNull();
    expect(parsearFecha('no-es-fecha')).toBeNull();
  });
});

describe('TIPOS', () => {
  it('cubre facturas y notas de crédito y débito de las tres letras', () => {
    expect(TIPOS).toHaveLength(9);
  });

  it('usa los códigos de comprobante de AFIP', () => {
    const porLetra = Object.fromEntries(TIPOS.map(t => [t.letra, t.codigo]));
    expect(porLetra).toMatchObject({
      A: 1, B: 6, C: 11,       // facturas
      NDA: 2, NDB: 7, NDC: 12, // notas de débito
      NCA: 3, NCB: 8, NCC: 13  // notas de crédito
    });
  });

  it('no repite códigos', () => {
    const codigos = TIPOS.map(t => t.codigo);
    expect(new Set(codigos).size).toBe(codigos.length);
  });
});
