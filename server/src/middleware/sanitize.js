const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * Campos que aceptan HTML enriquecido porque los edita un administrador
 * desde un editor del panel (plantillas de email, paginas de contenido).
 *
 * Para estos campos NO se eliminan todas las etiquetas: se sanitizan con el
 * perfil HTML de DOMPurify, que descarta script/svg/mathml, los manejadores
 * de eventos y los protocolos peligrosos (javascript:, data: ejecutable),
 * pero conserva el marcado legitimo.
 *
 * Cualquier campo que no este en esta lista se sigue limpiando de forma
 * estricta (se eliminan todas las etiquetas), que es lo correcto para el
 * contenido que envian los clientes: nombres, resenas, direcciones, etc.
 */
const RICH_TEXT_FIELDS = new Set([
  'htmlContent', // EmailTemplate: cuerpo HTML de la plantilla
  'content'      // ContentPage: cuerpo de las paginas institucionales y legales
]);

/**
 * Middleware to sanitize request body, query params, and params
 * Prevents XSS attacks by cleaning HTML/Script content
 */
const sanitizeInput = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query params
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize URL params
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * Recursively sanitize object properties.
 * `key` es el nombre de la propiedad que contiene a `obj`: sirve para
 * decidir si el valor admite HTML enriquecido o se limpia por completo.
 */
const sanitizeObject = (obj, key = null) => {
  if (typeof obj === 'string') {
    if (key && RICH_TEXT_FIELDS.has(key)) {
      // USE_PROFILES.html permite todo el HTML seguro y excluye SVG y MathML.
      return DOMPurify.sanitize(obj, { USE_PROFILES: { html: true } });
    }
    return DOMPurify.sanitize(obj, {
      ALLOWED_TAGS: [], // Strip all HTML tags
      ALLOWED_ATTR: []
    });
  }

  if (Array.isArray(obj)) {
    // Los elementos de un array heredan la clave del array que los contiene.
    return obj.map(item => sanitizeObject(item, key));
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized = {};
    for (const prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        sanitized[prop] = sanitizeObject(obj[prop], prop);
      }
    }
    return sanitized;
  }

  return obj;
};

/**
 * Sanitize HTML content but allow safe tags (for descriptions, etc)
 */
const sanitizeHTML = (dirty, allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br']) => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: []
  });
};

module.exports = { sanitizeInput, sanitizeHTML, RICH_TEXT_FIELDS };
