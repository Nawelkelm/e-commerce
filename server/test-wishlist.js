const { Wishlist, Product, Category, User } = require('./src/models');

async function testWishlist() {
  try {
    console.log('Testing Wishlist query...');
    
    const wishlistItems = await Wishlist.findAll({
      limit: 5,
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
      ]
    });

    console.log('✅ Query successful!');
    console.log('Found', wishlistItems.length, 'wishlist items');
    
    if (wishlistItems.length > 0) {
      const item = wishlistItems[0];
      console.log('Sample item:', {
        id: item.id,
        productId: item.productId,
        hasProduct: !!item.product
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Query failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.original) {
      console.error('Original error:', error.original.message);
    }
    process.exit(1);
  }
}

testWishlist();
