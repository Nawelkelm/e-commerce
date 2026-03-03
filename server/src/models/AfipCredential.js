const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AfipCredential = sequelize.define('AfipCredential', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Configuración Principal',
    comment: 'Nombre descriptivo de la configuración'
  },
  cuit: {
    type: DataTypes.STRING(11),
    allowNull: false,
    validate: {
      is: /^[0-9]{11}$/,
      notEmpty: true
    },
    comment: 'CUIT de la empresa (11 dígitos sin guiones)'
  },
  businessName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Razón social de la empresa'
  },
  certificate: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Contenido del certificado digital (.crt) en formato PEM'
  },
  privateKey: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Clave privada (.key) en formato PEM'
  },
  pointOfSale: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 9999
    },
    comment: 'Punto de venta autorizado por AFIP'
  },
  production: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'true = Producción, false = Homologación/Testing'
  },
  taxCategory: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'responsable_inscripto',
    validate: {
      isIn: [['responsable_inscripto', 'responsable_monotributo', 'exento', 'no_responsable', 'consumidor_final']]
    },
    comment: 'Categoría tributaria del emisor'
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Dirección fiscal de la empresa'
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Ciudad'
  },
  postalCode: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Código postal'
  },
  province: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Provincia'
  },
  iibbNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Número de Ingresos Brutos'
  },
  activityStartDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Fecha de inicio de actividades'
  },
  lastConnectionTest: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Última vez que se probó la conexión con AFIP'
  },
  connectionStatus: {
    type: DataTypes.STRING,
    defaultValue: 'not_configured',
    validate: {
      isIn: [['not_configured', 'connected', 'error', 'testing']]
    },
    comment: 'Estado de la conexión con AFIP'
  },
  lastError: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Último error de conexión o autorización'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si esta configuración está activa'
  },
  config: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Configuraciones adicionales en formato JSON'
  }
}, {
  tableName: 'afip_credentials',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['cuit']
    },
    {
      fields: ['isActive']
    }
  ]
});

// Método para verificar si tiene credenciales configuradas
AfipCredential.prototype.hasCredentials = function() {
  return !!(this.certificate && this.privateKey && this.cuit);
};

// Método para obtener el ambiente
AfipCredential.prototype.getEnvironment = function() {
  return this.production ? 'production' : 'testing';
};

module.exports = AfipCredential;
