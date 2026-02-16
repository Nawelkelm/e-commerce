const { Wishlist, Product, Category, User } = require('../models');
const logger = require('../config/logger');

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    console.log('=== GET WISHLIST CALLED ===');
    const userId = req.user.id;
    console.log('User ID:', userId);

    const wishlistItems = await Wishlist.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'product',
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name', 'slug']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log('Wishlist items found:', wishlistItems.length);

    // Format response
    const wishlist = wishlistItems.map(item => ({
      id: item.id,
      productId: item.productId,
      addedAt: item.createdAt,
      product: item.product ? {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.price,
        salePrice: item.product.salePrice,
        images: item.product.images,
        stock: item.product.stock,
        isActive: item.product.isActive,
        category: item.product.category
      } : null
    }));

    console.log('Sending response with', wishlist.length, 'items');
    res.json({
      wishlist,
      count: wishlist.length
    });
  } catch (error) {
    console.error('=== GET WISHLIST ERROR ===');
    console.error('Error details:', error);
    logger.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Error al obtener la lista de deseos' });
  }
};

// Add product to wishlist
const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'ID de producto requerido' });
    }

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({
      where: { userId, productId }
    });

    if (existing) {
      return res.status(400).json({ 
        message: 'El producto ya está en tu lista de deseos' 
      });
    }

    // Add to wishlist
    const wishlistItem = await Wishlist.create({
      userId,
      productId
    });

    logger.info(`Product ${productId} added to wishlist by user ${userId}`);

    res.status(201).json({
      message: 'Producto agregado a la lista de deseos',
      wishlistItem: {
        id: wishlistItem.id,
        productId: wishlistItem.productId,
        addedAt: wishlistItem.createdAt
      }
    });
  } catch (error) {
    logger.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Error al agregar a la lista de deseos' });
  }
};

// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: 'ID de producto requerido' });
    }

    const deleted = await Wishlist.destroy({
      where: { userId, productId }
    });

    if (deleted === 0) {
      return res.status(404).json({ 
        message: 'Producto no encontrado en la lista de deseos' 
      });
    }

    logger.info(`Product ${productId} removed from wishlist by user ${userId}`);

    res.json({ 
      message: 'Producto eliminado de la lista de deseos' 
    });
  } catch (error) {
    logger.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Error al eliminar de la lista de deseos' });
  }
};

// Check if product is in wishlist
const isInWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const exists = await Wishlist.findOne({
      where: { userId, productId }
    });

    res.json({ 
      isInWishlist: !!exists 
    });
  } catch (error) {
    logger.error('Check wishlist error:', error);
    res.status(500).json({ message: 'Error al verificar lista de deseos' });
  }
};

// Get wishlist count
const getWishlistCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Wishlist.count({
      where: { userId }
    });

    res.json({ count });
  } catch (error) {
    logger.error('Get wishlist count error:', error);
    res.status(500).json({ message: 'Error al obtener conteo' });
  }
};

// Clear wishlist
const clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    await Wishlist.destroy({
      where: { userId }
    });

    logger.info(`Wishlist cleared for user ${userId}`);

    res.json({ 
      message: 'Lista de deseos vaciada' 
    });
  } catch (error) {
    logger.error('Clear wishlist error:', error);
    res.status(500).json({ message: 'Error al vaciar lista de deseos' });
  }
};

// Move product from wishlist to cart (bulk operation)
const moveToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productIds } = req.body; // Array of product IDs

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ 
        message: 'Se requiere un array de IDs de productos' 
      });
    }

    // This will be handled by the cart controller
    // Just return success for now
    res.json({ 
      message: 'Usa el endpoint de carrito para agregar productos',
      productIds 
    });
  } catch (error) {
    logger.error('Move to cart error:', error);
    res.status(500).json({ message: 'Error al mover productos' });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  getWishlistCount,
  clearWishlist,
  moveToCart
};
