const { replaceContentVariables, SIN_COMPLETAR } = require('../src/services/contentVariables');

// getContentVariables toca la base, asi que se testea el reemplazo puro, que
// es donde esta la logica.
describe('replaceContentVariables', () => {
  const valores = {
    razonSocial: 'Tienda Ejemplo S.R.L.',
    cuit: '30-12345678-9',
    email: 'hola@ejemplo.com',
    telefono: ''
  };

  it('reemplaza una variable por su valor', () => {
    expect(replaceContentVariables('Operado por {{razonSocial}}.', valores))
      .toBe('Operado por Tienda Ejemplo S.R.L..');
  });

  it('reemplaza varias variables en el mismo texto', () => {
    expect(replaceContentVariables('{{razonSocial}} - CUIT {{cuit}}', valores))
      .toBe('Tienda Ejemplo S.R.L. - CUIT 30-12345678-9');
  });

  it('reemplaza todas las apariciones de la misma variable', () => {
    expect(replaceContentVariables('{{cuit}} y {{cuit}}', valores))
      .toBe('30-12345678-9 y 30-12345678-9');
  });

  it('tolera espacios dentro de las llaves', () => {
    expect(replaceContentVariables('{{  razonSocial  }}', valores))
      .toBe('Tienda Ejemplo S.R.L.');
  });

  it('muestra una raya cuando el comercio no cargo el dato', () => {
    // Que el cliente vea "{{telefono}}" seria peor que ver una raya.
    expect(replaceContentVariables('Tel: {{telefono}}', valores))
      .toBe(`Tel: ${SIN_COMPLETAR}`);
  });

  it('deja intacta una variable desconocida', () => {
    // Puede ser texto del comercio, no un error de la plataforma.
    expect(replaceContentVariables('{{noExiste}}', valores)).toBe('{{noExiste}}');
  });

  it('no toca el HTML que rodea a las variables', () => {
    const html = '<p>Operado por <strong>{{razonSocial}}</strong>.</p>';
    expect(replaceContentVariables(html, valores))
      .toBe('<p>Operado por <strong>Tienda Ejemplo S.R.L.</strong>.</p>');
  });

  it('devuelve el contenido vacio tal cual', () => {
    expect(replaceContentVariables('', valores)).toBe('');
    expect(replaceContentVariables(null, valores)).toBeNull();
  });
});
