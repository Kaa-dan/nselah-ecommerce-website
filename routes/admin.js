const express = require("express")
const session = require("express-session");
const router = express()
const auth = require("../middlewares/adminAuth");
const adminController = require("../controllers/adminController");


const multer = require('../middlewares/multer')

router.use(session({secret: 'secertt',resave:false,saveUninitialized:true}));

router.get('/', adminController.loadLogin);
router.post('/', adminController.verifyLogin);

router.use(auth.isLogin) 
router.get('/logout', adminController.logout); 
router.get('/dashboard', adminController.loadDashboard);
router.get('/users', adminController.loadUsers);
router.get('/block',adminController.blockUser)

router.get('/category', adminController.loadCategory) 
router.post('/category', adminController.addCategory)
router.get('/deleteCategory', adminController.deleteCategory)
router.post('/listCategory', adminController.listCategory)
router.get('/products', adminController.loadProducts)
router.get('/addProducts', adminController.loadAddProducts) 
router.get('/editProducts', adminController.loadEditProducts) 
router.post('/updateImage', adminController.updateImage)
router.post('/uploadImage',multer.upload.array('image', 10), adminController.uploadImage)
router.post('/addProducts',multer.upload.array('image', 10), adminController.addProduct)  
router.post('/editProducts',multer.upload.array('image', 10), adminController.editProduct)  
router.get('/deleteProduct', adminController.deleteProduct)  

router.get('/coupons',adminController.loadCoupon)
router.post('/addCoupon',adminController.addCoupon)
router.post('/editCoupon',adminController.editCoupon)
router.post('/listCoupon',adminController.listCoupon)
router.get('/banners',adminController.loadBanner)
router.post('/addBanner',multer.upload.array('image',5),adminController.addBanner)
router.post('/editBanner',multer.upload.array('image',5),adminController.editBanner)
router.post('/listBanner', adminController.listBanner)
router.get('/deleteBanner',adminController.deleteBanner)
router.get('/orders',adminController.loadOrders)
router.get('/orderDetails',adminController.loadOrderDetails)
router.post('/editOrder',adminController.changeStatus)

router.post('/addOffer',adminController.addOffer)

module.exports = router;