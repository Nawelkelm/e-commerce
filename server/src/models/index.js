const { sequelize } = require('../config/database');

// Import models
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const { Cart, CartItem } = require('./Cart');
const { Order, OrderItem } = require('./Order');
const Role = require('./Role');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const Setting = require('./Setting');
const HomeSettings = require('./HomeSettings');
const Wishlist = require('./Wishlist');
const Coupon = require('./Coupon');
const CouponUsage = require('./CouponUsage');
const Supplier = require('./Supplier');
const RefreshToken = require('./RefreshToken');
const AuditLog = require('./AuditLog');
const Invoice = require('./Invoice');
const AfipCredential = require('./AfipCredential');
const Shipment = require('./Shipment');
const ShipmentTracking = require('./ShipmentTracking');
const LogisticsCredentials = require('./LogisticsCredentials');
const ShippingMethod = require('./ShippingMethod');
const BankAccount = require('./BankAccount');

// Import review and email models
const Review = require('./Review');
const ReviewHelpful = require('./ReviewHelpful');
const EmailTemplate = require('./EmailTemplate');
const EmailLog = require('./EmailLog');

// Import new stock management models
const StockReservation = require('./StockReservation');
const StockMovement = require('./StockMovement');
const StockAlert = require('./StockAlert');
const StockLocation = require('./StockLocation');
const ProductBarcode = require('./ProductBarcode');
const ProductBatch = require('./ProductBatch');

// Define associations
// User associations
User.hasMany(Product, { foreignKey: 'createdBy', as: 'createdProducts' });
User.hasOne(Cart, { foreignKey: 'userId' });
User.hasMany(Order, { foreignKey: 'userId' });
User.belongsTo(Role, { foreignKey: 'roleId', as: 'userRole' });
User.hasMany(RefreshToken, { foreignKey: 'userId' });
User.hasMany(AuditLog, { foreignKey: 'userId' });

// RefreshToken associations
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

// AuditLog associations
AuditLog.belongsTo(User, { foreignKey: 'userId' });

// Role associations
Role.hasMany(User, { foreignKey: 'roleId' });
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId' });

// Permission associations
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId' });

// RolePermission associations
RolePermission.belongsTo(Role, { foreignKey: 'roleId' });
RolePermission.belongsTo(Permission, { foreignKey: 'permissionId' });

// Category associations
Category.hasMany(Product, { foreignKey: 'categoryId' });

// Product associations
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Product.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Product.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });
Product.hasMany(CartItem, { foreignKey: 'productId' });
Product.hasMany(OrderItem, { foreignKey: 'productId' });

// Supplier associations
Supplier.hasMany(Product, { foreignKey: 'supplierId', as: 'products' });

// Cart associations
Cart.belongsTo(User, { foreignKey: 'userId' });
Cart.hasMany(CartItem, { foreignKey: 'cartId' });

// CartItem associations
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });

// Order associations
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
Order.hasOne(Invoice, { foreignKey: 'orderId', as: 'invoice' });
Order.hasOne(Shipment, { foreignKey: 'orderId', as: 'shipment' });

// OrderItem associations
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Invoice associations
Invoice.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Invoice.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Invoice, { foreignKey: 'userId', as: 'invoices' });

// Wishlist associations
Wishlist.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Wishlist.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
User.hasMany(Wishlist, { foreignKey: 'userId', as: 'wishlists' });
Product.hasMany(Wishlist, { foreignKey: 'productId', as: 'wishlists' });

// Coupon associations
Coupon.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Coupon.hasMany(CouponUsage, { foreignKey: 'couponId' });

// CouponUsage associations
CouponUsage.belongsTo(Coupon, { foreignKey: 'couponId' });
CouponUsage.belongsTo(User, { foreignKey: 'userId' });
CouponUsage.belongsTo(Order, { foreignKey: 'orderId' });
User.hasMany(CouponUsage, { foreignKey: 'userId' });
Order.hasMany(CouponUsage, { foreignKey: 'orderId' });

// Stock Management associations
// StockReservation
StockReservation.belongsTo(Product, { foreignKey: 'productId' });
StockReservation.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(StockReservation, { foreignKey: 'productId' });
User.hasMany(StockReservation, { foreignKey: 'userId' });

// StockMovement
StockMovement.belongsTo(Product, { foreignKey: 'productId' });
StockMovement.belongsTo(User, { foreignKey: 'userId', as: 'performer' });
Product.hasMany(StockMovement, { foreignKey: 'productId' });
User.hasMany(StockMovement, { foreignKey: 'userId' });

// StockAlert
StockAlert.belongsTo(Product, { foreignKey: 'productId' });
StockAlert.belongsTo(User, { foreignKey: 'resolvedBy', as: 'resolver' });
Product.hasMany(StockAlert, { foreignKey: 'productId' });

// StockLocation
StockLocation.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(StockLocation, { foreignKey: 'productId' });

// ProductBarcode
ProductBarcode.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(ProductBarcode, { foreignKey: 'productId' });

// ProductBatch
ProductBatch.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(ProductBatch, { foreignKey: 'productId' });

// Review associations
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Review.hasMany(ReviewHelpful, { foreignKey: 'reviewId', as: 'helpfulVotes' });
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });

// ReviewHelpful associations
ReviewHelpful.belongsTo(Review, { foreignKey: 'reviewId' });
ReviewHelpful.belongsTo(User, { foreignKey: 'userId' });

// EmailTemplate associations
EmailTemplate.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
User.hasMany(EmailTemplate, { foreignKey: 'createdBy', as: 'emailTemplates' });

// EmailLog associations
EmailLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
EmailLog.belongsTo(EmailTemplate, { foreignKey: 'templateId' });
User.hasMany(EmailLog, { foreignKey: 'userId', as: 'emailLogs' });
EmailTemplate.hasMany(EmailLog, { foreignKey: 'templateId' });

// Shipment associations
Shipment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Shipment.hasMany(ShipmentTracking, { foreignKey: 'shipmentId', as: 'trackingHistory' });

// ShipmentTracking associations
ShipmentTracking.belongsTo(Shipment, { foreignKey: 'shipmentId' });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Role,
  Permission,
  RolePermission,
  Setting,
  Wishlist,
  HomeSettings,
  Coupon,
  CouponUsage,
  Supplier,
  RefreshToken,
  AuditLog,
  Invoice,
  AfipCredential,
  StockReservation,
  StockMovement,
  StockAlert,
  StockLocation,
  ProductBarcode,
  ProductBatch,
  Shipment,
  ShipmentTracking,
  LogisticsCredentials,
  ShippingMethod,
  BankAccount,
  Review,
  ReviewHelpful,
  EmailTemplate,
  EmailLog
};