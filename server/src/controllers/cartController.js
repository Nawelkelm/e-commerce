const { validationResult } = require('express-validator');
const { Cart, CartItem, Product } = require('../models');
const logger = require('../config/logger');
const { Op } = require('sequelize');

// Get or create cart for user
const getOrCreateCart = async (userId, sessionId = null) => {
  let cart = await Cart.findOne({
    where: userId ? { userId } : { sessionId },
    include: [
      {
        model: CartItem,
        include: [
          {
            model: Product,
            attributes: ['id', 'name', 'slug', 'price', 'salePrice', 'stock', 'images', 'isActive']
          }
        ]
      }
    ]
  });

  if (!cart) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Cart expires in 7 days

    cart = await Cart.create({
      userId,
      sessionId,
      expiresAt
    });
    
    // Refetch to include associations
    cart = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'slug', 'price', 'salePrice', 'stock', 'images', 'isActive']
            }
          ]
        }
      ]
    });
  }

  return cart;
};

// Get user cart
const getCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'];

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'User authentication or session ID required' });
    }

    const cart = await getOrCreateCart(userId, sessionId);

    // Calculate cart totals
    const cartWithTotals = {
      ...cart.toJSON(),
      itemCount: cart.CartItems?.length || 0,
      totalQuantity: cart.CartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0,
      subtotal: cart.CartItems?.reduce((sum, item) => {
        const price = item.Product?.salePrice || item.Product?.price || item.price;
        return sum + (price * item.quantity);
      }, 0) || 0
    };

    res.json(cartWithTotals);
  } catch (error) {
    logger.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity = 1, attributes = {} } = req.body;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'];

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'User authentication or session ID required' });
    }

    // Verify product exists and is active
    const product = await Product.findOne({
      where: { id: productId, isActive: true }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found or inactive' });
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: 'Insufficient stock', 
        availableStock: product.stock 
      });
    }

    const cart = await getOrCreateCart(userId, sessionId);

    // Check if item already exists in cart with same attributes
    const existingItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productId,
        attributes
      }
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      
      // Check stock for new quantity
      if (product.stock < newQuantity) {
        return res.status(400).json({ 
          message: 'Insufficient stock for requested quantity', 
          availableStock: product.stock,
          currentCartQuantity: existingItem.quantity
        });
      }

      await CartItem.update(
        { quantity: newQuantity },
        { where: { id: existingItem.id } }
      );
    } else {
      await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
        price: product.salePrice || product.price,
        attributes
      });
    }

    // Return updated cart
    const updatedCart = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'slug', 'price', 'salePrice', 'stock', 'images', 'isActive']
            }
          ]
        }
      ]
    });

    logger.info(`Item added to cart: ${productId} (qty: ${quantity}) for user ${userId || sessionId}`);

    res.json({
      message: 'Item added to cart successfully',
      cart: updatedCart
    });
  } catch (error) {
    logger.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'];

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'User authentication or session ID required' });
    }

    // Find cart item
    const cartItem = await CartItem.findOne({
      where: { id: itemId },
      include: [
        {
          model: Cart,
          where: userId ? { userId } : { sessionId }
        },
        {
          model: Product,
          attributes: ['id', 'name', 'stock', 'isActive']
        }
      ]
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Check if product is still active
    if (!cartItem.Product.isActive) {
      return res.status(400).json({ message: 'Product is no longer available' });
    }

    // Check stock availability
    if (cartItem.Product.stock < quantity) {
      return res.status(400).json({ 
        message: 'Insufficient stock', 
        availableStock: cartItem.Product.stock 
      });
    }

    await CartItem.update(
      { quantity },
      { where: { id: itemId } }
    );

    // Return updated cart
    const cart = await Cart.findByPk(cartItem.Cart.id, {
      include: [
        {
          model: CartItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'slug', 'price', 'salePrice', 'stock', 'images', 'isActive']
            }
          ]
        }
      ]
    });

    logger.info(`Cart item updated: ${itemId} (qty: ${quantity}) for user ${userId || sessionId}`);

    res.json({
      message: 'Cart item updated successfully',
      cart
    });
  } catch (error) {
    logger.error('Update cart item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'];

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'User authentication or session ID required' });
    }

    // Find and delete cart item
    const cartItem = await CartItem.findOne({
      where: { id: itemId },
      include: [
        {
          model: Cart,
          where: userId ? { userId } : { sessionId }
        }
      ]
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await CartItem.destroy({ where: { id: itemId } });

    // Return updated cart
    const cart = await Cart.findByPk(cartItem.Cart.id, {
      include: [
        {
          model: CartItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'slug', 'price', 'salePrice', 'stock', 'images', 'isActive']
            }
          ]
        }
      ]
    });

    logger.info(`Item removed from cart: ${itemId} for user ${userId || sessionId}`);

    res.json({
      message: 'Item removed from cart successfully',
      cart
    });
  } catch (error) {
    logger.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'];

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'User authentication or session ID required' });
    }

    const cart = await Cart.findOne({
      where: userId ? { userId } : { sessionId }
    });

    if (cart) {
      await CartItem.destroy({ where: { cartId: cart.id } });
    }

    logger.info(`Cart cleared for user ${userId || sessionId}`);

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    logger.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Merge guest cart with user cart (after login)
const mergeCart = async (req, res) => {
  try {
    const { guestSessionId } = req.body;
    const userId = req.user.id;

    if (!guestSessionId) {
      return res.json({ message: 'No guest session to merge' });
    }

    // Find guest cart
    const guestCart = await Cart.findOne({
      where: { sessionId: guestSessionId },
      include: [{ model: CartItem }]
    });

    if (!guestCart || !guestCart.CartItems.length) {
      return res.json({ message: 'No guest cart items to merge' });
    }

    // Get or create user cart
    const userCart = await getOrCreateCart(userId);

    // Merge items
    for (const guestItem of guestCart.CartItems) {
      const existingUserItem = await CartItem.findOne({
        where: {
          cartId: userCart.id,
          productId: guestItem.productId,
          attributes: guestItem.attributes
        }
      });

      if (existingUserItem) {
        // Update quantity
        await CartItem.update(
          { quantity: existingUserItem.quantity + guestItem.quantity },
          { where: { id: existingUserItem.id } }
        );
      } else {
        // Create new item
        await CartItem.create({
          cartId: userCart.id,
          productId: guestItem.productId,
          quantity: guestItem.quantity,
          price: guestItem.price,
          attributes: guestItem.attributes
        });
      }
    }

    // Delete guest cart
    await CartItem.destroy({ where: { cartId: guestCart.id } });
    await Cart.destroy({ where: { id: guestCart.id } });

    // Return merged cart
    const mergedCart = await Cart.findByPk(userCart.id, {
      include: [
        {
          model: CartItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'slug', 'price', 'salePrice', 'stock', 'images', 'isActive']
            }
          ]
        }
      ]
    });

    logger.info(`Guest cart merged with user cart for user ${userId}`);

    res.json({
      message: 'Cart merged successfully',
      cart: mergedCart
    });
  } catch (error) {
    logger.error('Merge cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart
};