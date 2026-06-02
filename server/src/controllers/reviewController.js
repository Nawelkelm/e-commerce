const Review = require('../models/Review');
const ReviewHelpful = require('../models/ReviewHelpful');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const { Op } = require('sequelize');

// Create a new review
const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment, images } = req.body;
    const userId = req.userId;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      where: { userId, productId }
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Ya has dejado una reseña para este producto' });
    }

    // Check if user purchased this product
    const orderItem = await OrderItem.findOne({
      include: [{
        model: Order,
        where: { 
          userId,
          status: { [Op.in]: ['completed', 'delivered'] }
        }
      }],
      where: { productId }
    });

    const isVerifiedPurchase = !!orderItem;
    const orderId = orderItem ? orderItem.orderId : null;

    // Create review
    const review = await Review.create({
      productId,
      userId,
      orderId,
      rating,
      title,
      comment,
      images: images || [],
      isVerifiedPurchase,
      isApproved: false // Require admin approval
    });

    // Update product rating
    await updateProductRating(productId);

    res.status(201).json({
      message: 'Reseña creada exitosamente. Será visible después de la aprobación del administrador.',
      review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Error al crear la reseña', error: error.message });
  }
};

// Get reviews for a product
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, rating, sortBy = 'recent' } = req.query;

    const where = { 
      productId,
      isApproved: true // Only show approved reviews to public
    };

    if (rating) {
      where.rating = parseInt(rating);
    }

    let order = [['createdAt', 'DESC']]; // Default: recent
    if (sortBy === 'helpful') {
      order = [['helpfulCount', 'DESC']];
    } else if (sortBy === 'rating') {
      order = [['rating', 'DESC']];
    }

    const offset = (page - 1) * limit;

    const { count, rows: reviews } = await Review.findAndCountAll({
      where,
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order,
      limit: parseInt(limit),
      offset
    });

    // Get user's votes if authenticated
    let userVotes = {};
    if (req.userId) {
      const votes = await ReviewHelpful.findAll({
        where: {
          userId: req.userId,
          reviewId: { [Op.in]: reviews.map(r => r.id) }
        }
      });
      userVotes = votes.reduce((acc, vote) => {
        acc[vote.reviewId] = vote.isHelpful;
        return acc;
      }, {});
    }

    const reviewsWithVotes = reviews.map(review => ({
      ...review.toJSON(),
      userVote: userVotes[review.id] !== undefined ? userVotes[review.id] : null
    }));

    res.json({
      reviews: reviewsWithVotes,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error getting product reviews:', error);
    res.status(500).json({ message: 'Error al obtener las reseñas', error: error.message });
  }
};

// Get reviews by a user
const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestUserId = req.userId;

    // Only allow users to see their own reviews or admin to see all
    if (userId !== requestUserId && !req.isAdmin) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const reviews = await Review.findAll({
      where: { userId },
      include: [{
        model: Product,
        attributes: ['id', 'name', 'images']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ reviews });
  } catch (error) {
    console.error('Error getting user reviews:', error);
    res.status(500).json({ message: 'Error al obtener las reseñas del usuario', error: error.message });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment, images } = req.body;
    const userId = req.userId;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    // Only review owner can update
    if (review.userId !== userId) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // Update review
    await review.update({
      rating,
      title,
      comment,
      images: images || review.images,
      isApproved: false // Require re-approval after edit
    });

    // Update product rating
    await updateProductRating(review.productId);

    res.json({ message: 'Reseña actualizada exitosamente', review });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Error al actualizar la reseña', error: error.message });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    // Only review owner or admin can delete
    if (review.userId !== userId && !req.isAdmin) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const productId = review.productId;

    // Delete associated votes
    await ReviewHelpful.destroy({ where: { reviewId: id } });

    // Delete review
    await review.destroy();

    // Update product rating
    await updateProductRating(productId);

    res.json({ message: 'Reseña eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Error al eliminar la reseña', error: error.message });
  }
};

// Approve a review (Admin only)
const approveReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    await review.update({ isApproved: true });

    // Update product rating
    await updateProductRating(review.productId);

    res.json({ message: 'Reseña aprobada exitosamente', review });
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({ message: 'Error al aprobar la reseña', error: error.message });
  }
};

// Add admin response to a review (Admin only)
const addAdminResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    await review.update({
      adminResponse: response,
      adminRespondedAt: new Date()
    });

    res.json({ message: 'Respuesta agregada exitosamente', review });
  } catch (error) {
    console.error('Error adding admin response:', error);
    res.status(500).json({ message: 'Error al agregar la respuesta', error: error.message });
  }
};

// Vote helpful/not helpful
const voteHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const { isHelpful } = req.body;
    const userId = req.userId;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    // Check if user already voted
    const existingVote = await ReviewHelpful.findOne({
      where: { reviewId: id, userId }
    });

    if (existingVote) {
      // If same vote, remove it
      if (existingVote.isHelpful === isHelpful) {
        await existingVote.destroy();
        
        // Decrement count
        if (isHelpful) {
          await review.decrement('helpfulCount');
        } else {
          await review.decrement('notHelpfulCount');
        }

        return res.json({ 
          message: 'Voto eliminado',
          userVote: null,
          helpfulCount: review.helpfulCount - (isHelpful ? 1 : 0),
          notHelpfulCount: review.notHelpfulCount - (!isHelpful ? 1 : 0)
        });
      }

      // Change vote
      await existingVote.update({ isHelpful });

      // Update counts
      if (isHelpful) {
        await review.increment('helpfulCount');
        await review.decrement('notHelpfulCount');
      } else {
        await review.increment('notHelpfulCount');
        await review.decrement('helpfulCount');
      }
    } else {
      // Create new vote
      await ReviewHelpful.create({
        reviewId: id,
        userId,
        isHelpful
      });

      // Increment count
      if (isHelpful) {
        await review.increment('helpfulCount');
      } else {
        await review.increment('notHelpfulCount');
      }
    }

    await review.reload();

    res.json({ 
      message: 'Voto registrado',
      userVote: isHelpful,
      helpfulCount: review.helpfulCount,
      notHelpfulCount: review.notHelpfulCount
    });
  } catch (error) {
    console.error('Error voting helpful:', error);
    res.status(500).json({ message: 'Error al registrar el voto', error: error.message });
  }
};

// Get review statistics for a product
const getReviewStats = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.findAll({
      where: { productId, isApproved: true },
      attributes: ['rating']
    });

    if (reviews.length === 0) {
      return res.json({
        averageRating: 0,
        totalReviews: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    }

    const totalReviews = reviews.length;
    const sumRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (sumRating / totalReviews).toFixed(1);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });

    res.json({
      averageRating: parseFloat(averageRating),
      totalReviews,
      distribution
    });
  } catch (error) {
    console.error('Error getting review stats:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
};

// Get all reviews (Admin only)
const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, productId } = req.query;

    const where = {};
    
    if (status === 'pending') {
      where.isApproved = false;
    } else if (status === 'approved') {
      where.isApproved = true;
    }

    if (productId) {
      where.productId = productId;
    }

    const offset = (page - 1) * limit;

    const { count, rows: reviews } = await Review.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Product,
          attributes: ['id', 'name', 'images']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      reviews,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error getting all reviews:', error);
    res.status(500).json({ message: 'Error al obtener las reseñas', error: error.message });
  }
};

// Helper function to update product rating
const updateProductRating = async (productId) => {
  try {
    const reviews = await Review.findAll({
      where: { productId, isApproved: true },
      attributes: ['rating']
    });

    if (reviews.length === 0) {
      await Product.update(
        { averageRating: 0, totalReviews: 0 },
        { where: { id: productId } }
      );
      return;
    }

    const totalReviews = reviews.length;
    const sumRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (sumRating / totalReviews).toFixed(2);

    await Product.update(
      { averageRating: parseFloat(averageRating), totalReviews },
      { where: { id: productId } }
    );
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
};

module.exports = {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  approveReview,
  addAdminResponse,
  voteHelpful,
  getReviewStats,
  getAllReviews
};
