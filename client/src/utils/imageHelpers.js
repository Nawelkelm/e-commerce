// Generate a placeholder image as a data URI (SVG)
export const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik0yMDAgMTIwQzIxMS4wNDYgMTIwIDIyMCAxMTEuMDQ2IDIyMCAxMDBDMjIwIDg4Ljk1NDMgMjExLjA0NiA4MCAyMDAgODBDMTg4Ljk1NCA4MCAxODAgODguOTU0MyAxODAgMTAwQzE4MCAxMTEuMDQ2IDE4OC45NTQgMTIwIDIwMCAxMjBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yODAgMjIwTDI0MCAxNjBMMjAwIDIwMEwxNjAgMTYwTDEyMCAyMjBIMjgwWiIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSIyMDAiIHk9IjI2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCNzI4MCIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9InN5c3RlbS11aSI+U2luIGltYWdlbjwvdGV4dD4KPC9zdmc+'

// Helper to get image URL or placeholder
export const getImageUrl = (imageData) => {
  if (!imageData) return PLACEHOLDER_IMAGE
  
  // Si es una URL completa
  if (typeof imageData === 'string') {
    if (imageData.startsWith('http://') || imageData.startsWith('https://') || imageData.startsWith('/')) {
      return imageData
    }
    return `/uploads/products/${imageData}`
  }
  
  // Si es un objeto con url
  if (imageData.url) {
    // Si la URL es completa (http/https) o empieza con /, devolverla tal cual
    if (imageData.url.startsWith('http://') || imageData.url.startsWith('https://') || imageData.url.startsWith('/')) {
      return imageData.url
    }
    // Caso contrario, agregar el prefijo
    return `/uploads/products/${imageData.url}`
  }
  
  return PLACEHOLDER_IMAGE
}

// Helper specifically for product images
export const getProductImageUrl = (product) => {
  if (!product) return PLACEHOLDER_IMAGE
  
  // Try images array first
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return getImageUrl(product.images[0])
  }
  
  // Try single image field
  if (product.image) {
    return getImageUrl(product.image)
  }
  
  return PLACEHOLDER_IMAGE
}
