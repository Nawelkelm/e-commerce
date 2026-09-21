const { sanitizeInput } = require('../src/middleware/sanitize');

/** Corre el middleware sobre un body y devuelve el resultado. */
const run = (body) => {
  const req = { body };
  sanitizeInput(req, {}, () => {});
  return req.body;
};

describe('sanitizeInput', () => {
  describe('campos comunes (contenido de clientes)', () => {
    it('elimina todas las etiquetas HTML', () => {
      expect(run({ name: 'Juan <b>Perez</b>' }).name).toBe('Juan Perez');
    });

    it('elimina scripts inyectados', () => {
      expect(run({ comment: 'hola <script>alert(1)</script>' }).comment).toBe('hola ');
    });

    it('no toca los valores que no son string', () => {
      const out = run({ total: 1500, activo: true, vacio: null });
      expect(out).toEqual({ total: 1500, activo: true, vacio: null });
    });
  });

  describe('campos de texto enriquecido (editados por un admin)', () => {
    it('conserva el HTML de las plantillas de email, incluido el style inline', () => {
      const html = '<div style="color:red"><h1>Hola {{customerName}}</h1><p>Pedido <b>#123</b></p></div>';
      expect(run({ htmlContent: html }).htmlContent).toBe(html);
    });

    it('conserva el marcado seguro en las paginas de contenido', () => {
      const out = run({ content: '<p>Terminos</p><ul><li>uno</li></ul>' }).content;
      expect(out).toBe('<p>Terminos</p><ul><li>uno</li></ul>');
    });

    it('igual elimina los scripts', () => {
      const out = run({ content: '<p>ok</p><script>alert(1)</script>' }).content;
      expect(out).toBe('<p>ok</p>');
      expect(out).not.toContain('script');
    });

    it('igual elimina los manejadores de eventos', () => {
      const out = run({ content: '<img src="x" onerror="alert(1)">' }).content;
      expect(out).not.toContain('onerror');
    });

    it('igual elimina los enlaces con protocolo javascript:', () => {
      const out = run({ content: '<a href="javascript:alert(1)">click</a>' }).content;
      expect(out).not.toContain('javascript:');
    });
  });

  describe('objetos anidados', () => {
    it('aplica la regla segun el nombre del campo, no segun su profundidad', () => {
      const out = run({ tpl: { htmlContent: '<b>si</b>', nombre: '<b>no</b>' } });
      expect(out.tpl.htmlContent).toBe('<b>si</b>');
      expect(out.tpl.nombre).toBe('no');
    });

    it('sanitiza los elementos de un array', () => {
      expect(run({ tags: ['<b>uno</b>', 'dos'] }).tags).toEqual(['uno', 'dos']);
    });
  });
});
