const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth, adminAuth } = require('../middleware/auth');

// Public routes
router.get('/products/:productId/reviews', reviewController.getProductReviews);
router.get('/products/:productId/reviews/stats', reviewController.getReviewStats);

// Authenticated user routes
router.post('/products/:productId/reviews', auth, reviewController.createReview);
router.get('/users/:userId/reviews', auth, reviewController.getUserReviews);
router.put('/reviews/:id', auth, reviewController.updateReview);
router.delete('/reviews/:id', auth, reviewController.deleteReview);
router.post('/reviews/:id/vote', auth, reviewController.voteHelpful);

// Admin routes
router.get('/reviews', adminAuth, reviewController.getAllReviews);
router.patch('/reviews/:id/approve', adminAuth, reviewController.approveReview);
router.post('/reviews/:id/response', adminAuth, reviewController.addAdminResponse);

module.exports = router;
