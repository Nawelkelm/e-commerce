const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Paginas de contenido institucionales y legales (terminos, privacidad,
 * preguntas frecuentes, sobre nosotros, etc.).
 *
 * El footer ya enlazaba estas URLs, pero las paginas no existian. En vez de
 * hardcodear una por una, cada tienda las edita desde el panel: TiendaKit es
 * white-label y cada cliente necesita su propio texto.
 */
const ContentPage = sequelize.define('ContentPage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  slug: {
    type: DataTypes.STRING(120),
    allowNull: false,
    comment: 'Identificador en la URL, sin barra inicial. Ej: "terminos"',
    validate: {
      notEmpty: true,
      is: {
        args: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        msg: 'El slug solo admite minusculas, numeros y guiones'
      }
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
    comment: 'Cuerpo HTML. Se sanitiza en el middleware (RICH_TEXT_FIELDS)'
  },
  excerpt: {
    type: DataTypes.STRING(300),
    allowNull: true,
    comment: 'Resumen corto, opcional, para listados'
  },
  metaTitle: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  metaDescription: {
    type: DataTypes.STRING(300),
    allowNull: true
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si esta en false, la pagina responde 404 al publico'
  },
  isSystem: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Paginas que trae la plataforma: se pueden editar pero no borrar'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'ContentPages',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['slug'] }
  ]
});

module.exports = ContentPage;
