const express =  require('express');
const  session = require('express-session');
const router = express();
const blockUser = require('../middlewares/blockUser')
const userController =require('../controllers/userControllers');
const auth = require("../middlewares/auth");
const multer = require('../middlewares/multer')



router.use( session({secret: 'sessionSecret',resave: false,saveUninitialized: true }))
router.use('/', blockUser)



router.get('/',userController.loadHome);
router.get('/products',userController.loadProducts)
router.get('/productDetail',userController.loadProductDetail)


router.get('/login',auth.isLogout,userController.loadLogin);
router.post('/login',userController.verifyLogin)
router.get('/register',userController.loadRegister);
router.post('/register',userController.loadOTP);
router.get('/otp',userController.resendOtp);
router.post('/otp',userController.verifyOtp);
router.get('/logout',userController.logout)


router.get('/addToWishList',userController.addToWishList)
router.get('/addToCart',userController.addToCart)

router.get('/wishList',userController.loadWishList)
router.get('/cart',userController.loadCart)

router.get('/deleteFromWishList',userController.deleteFromWishList)
router.post('/updateCart',userController.updateCart)
router.get('/deleteCart',userController.deleteCart)

router.get('/profile',userController.loadProfile)
router.get('/profileAddress',userController.loadProfileAddress)
router.get('/orderDetails',userController.loadOrderDetails)
router.get('/singleOrderDetails',userController.singleOrderDetails)
router.get('/editProfile',userController.loadEditProfile)


router.get('/resetPassword2',userController.forgetPassword2);
router.post('/resetPassword2',userController.loadOtpVerification2)
router.get("/resendOtpLogin",userController.resendOtpVerification2)
router.post('/submitLoginOtp',userController.loadResetPassword2)
router.post('/confirmPassword3',userController.passwordVerification2)



router.get('/changePassword',userController.loadNumberVerification)
router.post('/changePassword',userController.loadOtpVerification)
router.get('/otpVerification',userController.resendOtpVerification)
router.post('/otpVerfication',userController.loadResetPassword)
router.post('/confirmPassword',userController.passwordVerification1)

router.post('/editProfile',userController.changeUsername)
router.post('/profileAddress',userController.saveProfileAddress)
router.get('/deleteAddress',userController.deleteAddress)
router.get('/cancellOrder',userController.cancellOrder);
router.post('/editAddress',userController.editAddress)
router.post('/editProfileImage',multer.upload.single('image'),userController.editImage)


router.get('/address',userController.loadAddress)
router.post('/addAdress',userController.saveAddress)
router.post('/offer',userController.applyCoupon)



router.get('/checkOut',userController.loadCheckOut);
router.post('/checkOut',userController.placeCod);
router.post('/success',userController.saveOnline)
router.post('/successWallet',userController.saveOnline2)
router.get('/returnOrder',userController.returnOrder)


router.get('/error',userController.error);





















































module.exports= router;