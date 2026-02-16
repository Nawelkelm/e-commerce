#!/usr/bin/env node

/**
 * Script para actualizar las URLs de imágenes de productos
 * Cambia via.placeholder.com a placehold.co que es más confiable
 */

const { Product } = require('../models');

async function fixProductImages() {
  try {
    console.log('🖼️  Actualizando URLs de imágenes de productos...\n');

    // Obtener todos los productos
    const products = await Product.findAll();
    
    let updatedCount = 0;

    for (const product of products) {
      if (product.images && Array.isArray(product.images)) {
        // Reemplazar via.placeholder.com con placehold.co
        const updatedImages = product.images.map(imageUrl => {
          if (typeof imageUrl === 'string' && imageUrl.includes('via.placeholder.com')) {
            // Extraer el texto del placeholder
            const match = imageUrl.match(/text=([^&]+)/);
            const text = match ? match[1] : 'Product';
            
            // Crear nueva URL con placehold.co (formato: https://placehold.co/400x400/png?text=...)
            return `https://placehold.co/400x400/EEE/333?text=${text}`;
          }
          return imageUrl;
        });

        // Actualizar solo si hubo cambios
        if (JSON.stringify(updatedImages) !== JSON.stringify(product.images)) {
          await product.update({ images: updatedImages });
          console.log(`✅ Actualizado: ${product.name}`);
          updatedCount++;
        }
      }
    }

    console.log(`\n✨ Proceso completado!`);
    console.log(`📊 Productos actualizados: ${updatedCount}`);
    console.log(`📁 Total de productos: ${products.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error actualizando imágenes:', error);
    process.exit(1);
  }
}

fixProductImages();
