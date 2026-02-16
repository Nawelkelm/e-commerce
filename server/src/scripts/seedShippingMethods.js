const { ShippingMethod } = require('../models')

async function seedShippingMethods() {
  try {
    console.log('🌱 Iniciando seed de métodos de envío...')

    // Verificar si ya existen métodos
    const existingCount = await ShippingMethod.count()
    if (existingCount > 0) {
      console.log(`✓ Ya existen ${existingCount} métodos de envío. Omitiendo seed.`)
      return
    }

    // Métodos de envío por defecto
    const defaultMethods = [
      {
        name: 'Acordar con el Vendedor',
        code: 'ACORDAR_VENDEDOR',
        type: 'agreement',
        description: 'Coordinar forma y costo de envío directamente con el vendedor',
        price: null, // Precio variable a coordinar
        isFree: false,
        requiresAddress: false,
        displayOrder: 0,
        isActive: true
      },
      {
        name: 'Retiro en Local',
        code: 'RETIRO_LOCAL',
        type: 'pickup',
        description: 'Retiro sin cargo en nuestro local comercial',
        price: 0,
        isFree: true,
        requiresAddress: false,
        pickupAddress: {
          street: 'Av. Corrientes 1234',
          city: 'CABA',
          state: 'Buenos Aires',
          postalCode: '1043',
          phone: '011-1234-5678',
          hours: 'Lunes a Viernes de 9 a 18hs'
        },
        estimatedDays: 0,
        displayOrder: 1,
        isActive: true
      },
      {
        name: 'Andreani',
        code: 'ANDREANI',
        type: 'carrier',
        carrier: 'Andreani',
        description: 'Envío a domicilio o sucursal a través de Andreani',
        estimatedDays: 3,
        requiresAddress: true,
        displayOrder: 2,
        isActive: false // Inactivo hasta que se configuren las credenciales
      },
      {
        name: 'OCA',
        code: 'OCA',
        type: 'carrier',
        carrier: 'OCA',
        description: 'Envío a domicilio o sucursal a través de OCA',
        estimatedDays: 4,
        requiresAddress: true,
        displayOrder: 3,
        isActive: false // Inactivo hasta que se configuren las credenciales
      },
      {
        name: 'Correo Argentino',
        code: 'CORREO_ARGENTINO',
        type: 'carrier',
        carrier: 'Correo Argentino',
        description: 'Envío a domicilio o sucursal a través de Correo Argentino',
        estimatedDays: 5,
        requiresAddress: true,
        displayOrder: 4,
        isActive: false // Inactivo hasta que se configuren las credenciales
      },
      {
        name: 'Envío a Domicilio CABA',
        code: 'ENVIO_CABA',
        type: 'custom',
        description: 'Envío propio a domicilio dentro de Capital Federal',
        price: 500,
        isFree: false,
        freeFromAmount: 15000,
        estimatedDays: 1,
        zones: ['CABA', '1000-1999'],
        requiresAddress: true,
        displayOrder: 5,
        isActive: true
      },
      {
        name: 'Envío a Domicilio GBA',
        code: 'ENVIO_GBA',
        type: 'custom',
        description: 'Envío propio a domicilio en Gran Buenos Aires',
        price: 800,
        isFree: false,
        freeFromAmount: 20000,
        estimatedDays: 2,
        zones: [
          '1600-1999', // Zona Norte
          '1700-1899', // Zona Oeste
          '1800-1899', // Zona Sur
        ],
        requiresAddress: true,
        displayOrder: 6,
        isActive: true
      }
    ]

    // Crear métodos
    const created = await ShippingMethod.bulkCreate(defaultMethods)
    
    console.log(`✓ Se crearon ${created.length} métodos de envío por defecto:`)
    created.forEach(method => {
      console.log(`  - ${method.name} (${method.code}) - ${method.type}`)
    })

    console.log('🌱 Seed de métodos de envío completado!')
    return created

  } catch (error) {
    console.error('❌ Error en seed de métodos de envío:', error)
    throw error
  }
}

// Permitir ejecutar el script directamente
if (require.main === module) {
  seedShippingMethods()
    .then(() => {
      console.log('✓ Proceso completado')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Error en el proceso:', error)
      process.exit(1)
    })
}

module.exports = seedShippingMethods
