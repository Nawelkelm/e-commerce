-- Crear sección de Ofertas Especiales
UPDATE "Settings" 
SET value = '[
  {
    "id": 1729692000000,
    "title": "Ofertas Especiales",
    "subtitle": "Aprovecha nuestros cupones de descuento exclusivos y ahorra en tu próxima compra",
    "icon": "GiftIcon",
    "backgroundColor": "#7c3aed",
    "textColor": "#ffffff",
    "buttonText": "Ver Cupones",
    "buttonLink": "/cupones",
    "order": 1,
    "enabled": true
  }
]'
WHERE key = 'home_sections';
