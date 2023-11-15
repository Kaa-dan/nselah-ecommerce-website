const bcrypt = require("bcrypt");
const Category = require("../models/category");
const User = require("../models/userModel");
const Product = require("../models/product");

const fastSms = require("../middlewares/fast2sms");
const Banner = require("../models/banner");
const Coupon = require("../models/coupon");
const RazorPay = require("razorpay");

const Address = require("../models/address");
const Order = require("../models/orders");
require("dotenv").config();

const loadHome = async (req, res, next) => {
  try {
    const banner = await Banner.findOne({ is_active: 1 });
    const product = await Product.find().sort({ $natural: -1 });
    res.render("users/home", { product, banner, user: req.session.user });
  } catch (error) {
    res.redirect("/error");
  }
};

const loadRegister = async (req, res, next) => {
  try {
    res.render("users/register", { user: req.session.user });
  } catch (error) {
    res.redirect("/error");
  }
};

const loadLogin = async (req, res, next) => {
  try {
    res.render("users/login", { user: req.session.user, message: "" });
  } catch (error) {
    res.redirect("/error");
  }
};

const loadOTP = async (req, res, next) => {
  try {
    const existingUser = await User.findOne({
      $or: [{ email: req.body.email }, { mobile: req.body.phone }],
    });
    if (existingUser) {
      res.render("users/login", {
        message: "user already exits",
        user: req.session.user,
      });
    } else {
      const tempUser = {
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.phone,
        password: req.body.password,
        is_admin: 0,
      };

      newOtp = fastSms.sendMessage(req.body.phone, res);

      req.session.tempUser = tempUser;
      req.session.otp = newOtp;
      // const userData = await User.find();
      res.render("users/otp", {
        user: req.session.user,
        mobile: req.session.tempUser.mobile,
        message: "otp sent successfully",
      });
    }
  } catch (error) {
    res.redirect("/error");
  }
};

const logout = async (req, res) => {
  try {
    req.session.user = null;
    req.session.user1 = null;
    req.session.user_id = null;
    res.redirect("/");
  } catch (error) {
    res.redirect("/error");
  }
};

const resendOtp = async (req, res, next) => {
  try {
    newOtp = fastSms.sendMessage(req.session.tempUser.mobile, res);

    req.session.otp = newOtp;
    // const userData = await User.find();
    res.render("users/otp", {
      user: req.session.user,
      mobile: req.session.tempUser.mobile,
      message: "otp resent successfully",
    });
  } catch (error) {
    res.redirect("/error");
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    if (req.session.otp == req.body.otp) {
      const password = await bcrypt.hash(req.session.tempUser.password, 10);

      const tempUser = new User({
        name: req.session.tempUser.name,
        email: req.session.tempUser.email,
        mobile: req.session.tempUser.mobile,
        password: password,
      });
      await tempUser.save().then(() => console.log("register success"));
      const email = req.session.tempUser.email;
      const user = await User.findOne({ email, is_admin: 0 });

      if (user) {
        req.session.tempUser = null;
        req.session.otp = null;
        req.session.user = user;
        req.session.user_id = user._id;
        req.session.user1 = true;
        res.redirect("/");
      } else {
        0;
        res.render("users/otp");
      }
    } else {
      res.render("users/otp");
    }
  } catch (error) {
    res.redirect("/error");
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
console.log(email, password)
    const user = await User.findOne({
      email,
      is_admin: 0,
    });
    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        if (user.is_verified) {
          req.session.user = user;
          req.session.user_id = user._id;
          req.session.user1 = true;

          res.redirect("/");
        } else {
          res.render("users/login", {
            message:
              "You have been temporarily blocked by the Administrator , Please login after sometime",
            user: req.session.user,
          });
        }
      } else {
        res.render("users/login", {
          message: "email or password is incorrect",
          user: req.session.user,
        });
      }
    } else {
      res.render("users/login", {
        message: "invalid user credentials",
        active: 0,
        user: req.session.user,
      });
    }
  } catch (error) {
    res.redirect("/error");
  }
};

const loadProducts = async (req, res) => {
  try {
    const categoryData = await Category.find();
    let { search, sort, category, page, ajax } = req.query;
    if (!search) {
      search = "";
    }
    skip = 0;
    limit = 9;
    if (!page) {
      page = 0;
    }
    skip = page * limit;
    let arr = [];
    if (category) {
      for (i = 0; i < category.length; i++) {
        arr = [...arr, categoryData[category[i]].name];
      }
    } else {
      category = [];
      arr = categoryData.map((x) => x.name);
    }

    if (sort == 0) {
      productData = await Product.find({
        isAvailable: 1,
        $and: [
          { category: arr },
          {
            $or: [
              { name: { $regex: "" + search + ".*" } },
              { category: { $regex: ".*" + search + ".*" } },
            ],
          },
        ],
      }).sort({ $natural: -1 });
      pageCount = Math.floor(productData.length / limit);
      if (productData.length % limit > 0) {
        pageCount += 1;
      }

      productData = await Product.find({
        isAvailable: 1,
        $and: [
          { category: arr },
          {
            $or: [
              { name: { $regex: "" + search + ".*" } },
              { category: { $regex: ".*" + search + ".*" } },
            ],
          },
        ],
      })
        .sort({ $natural: -1 })
        .skip(skip)
        .limit(limit);
    } else {
      productData = await Product.find({
        isAvailable: 1,
        $and: [
          { category: arr },
          {
            $or: [
              { name: { $regex: "" + search + ".*" } },
              { category: { $regex: ".*" + search + ".*" } },
            ],
          },
        ],
      }).sort({ price: sort });
      pageCount = Math.floor(productData.length / limit);
      if (productData.length % limit > 0) {
        pageCount += 1;
      }

      productData = await Product.find({
        isAvailable: 1,
        $and: [
          { category: arr },
          {
            $or: [
              { name: { $regex: "" + search + ".*" } },
              { category: { $regex: ".*" + search + ".*" } },
            ],
          },
        ],
      })
        .sort({ price: sort })
        .skip(skip)
        .limit(limit);
    }

    if (req.session.user) {
      session = req.session.user;
    } else session = false;
    if (pageCount == 0) {
      pageCount = 1;
    }
    if (ajax) {
      res.json({ products: productData, pageCount, page });
    } else {
      res.render("users/products", {
        user: req.session.user,
        product: productData,
        category: categoryData,
        val: search,
        selected: category,
        order: sort,
        limit: limit,
        pageCount,
        page,
      });
    }
  } catch (error) {
    res.redirect("/error");
  }
};

const loadProductDetail = async (req, res, next) => {
  try {
    productData = await Product.findOne({ _id: req.query.id });
    if (req.session.user) {
      session = req.session.user;
    } else session = false;
    res.render("users/productDetail", { productData, user: req.session.user });
  } catch (error) {
    res.redirect("/error");
  }
};

const loadProfile = async function (req, res) {
  try {
    if (req.session.user) {
      const userData = await User.findOne({ _id: req.session.user_id });
      res.render("users/profile", { user: userData, head: 5, userData });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect("/error");
  }
};

const loadWishList = async (req, res, next) => {
  try {
    if (req.session.user) {
      const userData = await User.findOne({ _id: req.session.user_id });
      const wishData = await userData.populate("wishlist.item.productId");
      res.render("users/wishList", {
        user: req.session.user,
        wishProduct: wishData.wishlist,
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect("/error");
  }
};

const addToWishList = async (req, res, next) => {
  try {
    const productId = req.query.id;

    if (req.session.user_id) {
      const userData = await User.findById({ _id: req.session.user_id });
      const productData = await Product.findById({ _id: productId });
      await userData.addToWishList(productData);
      res.redirect("/products");
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect("/error");
  }
};

const deleteFromWishList = async (req, res) => {
  const productId = req.query.id;
  const user = await User.findById({ _id: req.session.user._id });
  await user.removefromWishlist(productId);
  res.redirect("/wishList");
};

const loadCart = async (req, res) => {
  try {
    if (req.session.user) {
      const userData = await User.findById({ _id: req.session.user_id });
      const cartData = await userData.populate("cart.item.productId");
      res.render("users/cart", {
        user: req.session.user,
        cartProduct: cartData.cart,
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.redirect("/error");
  }
};

const loadAddress = async (req, res) => {
  try {
    if (req.session.user) {
      const addressData = await Address.find({ userId: req.session.user_id });
      res.render("users/address", {
        user: req.session.user,
        address: addressData,
      });
    } else {
      res.redirect("login");
    }
  } catch (error) {
    res.redirect("/error");
  }
};

const addToCart = async (req, res, next) => {
  try {
    const productId = req.query.id;

    userSession = req.session.user_id;

    if (userSession) {
      const userData = await User.findById({ _id: req.session.user_id });
      const productData = await Product.findById({ _id: productId });
      await userData.addToCart(productData);
      res.redirect("/cart");
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect("/error");
  }
};
const updateCart = async (req, res) => {
  try {
    let { quantity, _id } = req.body;
    const userData = await User.findById({ _id: req.session.user_id });
    const total = await userData.updateCart(_id, quantity);
    res.json({ total });
  } catch (error) {
    res.redirect("/error");
  }
};

const deleteCart = async (req, res) => {
  try {
    const productId = req.query.id;

    const user = await User.findById({ _id: req.session.user_id });

    await user.removefromCart(productId);
    res.redirect("/cart");
  } catch (error) {
    res.redirect("/error");
  }
};

const loadNumberVerification = (req, res) => {
  try {
    if (req.session.user) {
      res.render("users/resetOtpNumber", { user: req.session.user });
    } else {
      redirect("/login");
    }
  } catch {
    res.redirect("/error");
  }
};

const loadOtpVerification = async (req, res) => {
  try {
    const user = req.session.user;
    console.log(user);
    const mobile = req.body.phone;
    console.log(mobile);
    //   console.log(req.ression.user.mobile)
    if (user.mobile == mobile) {
      console.log(1);
      const user = await User.findOne({ mobile: mobile });
      if (user) {
        console.log(2);
        newOtp = fastSms.sendMessage(mobile, res);
        req.session.otp = newOtp;
        req.session.mob = mobile;
        console.log(newOtp);

        res.render("users/resetOtp", {
          user: req.session.user,
          mobile: mobile,
          message: "otp sent successfully",
        });
      } else {
        console.log(3);
        res.redirect("/profile");
      }
    } else {
      console.log(4);
      res.redirect("/profile");
    }
  } catch (error) {
    res.redirect("/error");
  }
};

const resendOtpVerification = async (req, res, next) => {
  try {
    newOtp = fastSms.sendMessage(req.session.mob, res);
    req.session.otp = newOtp;
    console.log(newOtp);
    // const userData = await User.find();
    res.render("users/resetOtp", {
      user: req.session.user,
      mobile: req.session.mob,
      message: "otp resent successfully",
    });
  } catch (error) {
    res.redirect("/error");
  }
};

const loadResetPassword = async (req, res, next) => {
  try {
    if (req.body.otp == req.session.otp) {
      res.render("users/resetPassword", { user: req.session.user });
    } else {
      redirect("/otpVerification");
    }
  } catch (error) {
    res.redirect("/error");
  }
};

const passwordVerification1 = async (req, res, next) => {
  try {
    id = req.session.user._id;
    const newPass = await bcrypt.hash(req.body.password, 10);
    const user = await User.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          password: newPass,
        },
      }
    );
    req.session.user = null;
    req.session.user1 = null;
    req.session.user_id = null;
    req.session.mob = null;
    req.session.otp = null;
    res.redirect("/login");
  } catch (error) {
    res.redirect("/error");
  }
};

const loadEditProfile = async (req, res, next) => {
  try {
    if (req.session.user) {
      res.render("users/editProfile", { user: req.session.user });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect("/error");
  }
};

const changeUsername = async (req, res, next) => {
  try {
    const userName = req.body.name;
    id = req.session.user._id;
    const user1 = await User.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          name: userName,
        },
      }
    );
    const user = await User.findOne({ _id: id });
    req.session.user = user;

    res.redirect("/profile");
  } catch (error) {
    res.redirect("/error");
  }
};

const loadCheckOut = async (req, res) => {
  try {
    if (req.session.user) {
      const coupon = await Coupon.find({ isAvailable: 1 });

      const userData = await User.findById({ _id: req.session.user_id });
      const cartData = await userData.populate("cart.item.productId");
      const addressData = await Address.find({ userId: req.session.user.id });

      res.render("users/userCheckOut", {
        user: req.session.user,
        products: cartData.cart,
        address: addressData,
        coupon,
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.redirect("/error");
  }
};

const saveAddress = async (req, res, next) => {
  try {
    const addressData = new Address({
      userId: req.session.user.id,
      firstname: req.body.firstName,
      lastname: req.body.lastName,
      country: req.body.country,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      mobile: req.body.mobile,
    });

    await addressData.save();
    res.redirect("/checkOut");
  } catch (error) {}
};
let order;
const placeCod = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.session.user._id });
    rupees = parseInt(req.body.rupees);
    const id = req.body.deliveryAddress;
    const address = await Address.findOne({ _id: id });
    order = new Order({
      userId: user._id,
      payment: req.body.payment,
      amount: rupees,
      address: address,
      products: user.cart,
    });

    if (req.body.payment == "COD") {
      for (let x of order.products.item) {
        await Product.updateOne(
          { _id: x.productId },
          { $inc: { stock: -x.qty } }
        );
      }
      await order.save();
      await User.updateOne({ _id: req.session.user }, { $unset: { cart: 1 } });
      res.render("users/success", { user: req.session.user });
    } else if (req.body.payment == "ONLINE") {
      var instance = new RazorPay({
        key_id: process.env.KEY_ID,
        key_secret: process.env.KEY_SECRET,
      });
      let razorpayOrder = await instance.orders.create({
        amount: rupees * 100,
        currency: "INR",
        receipt: order._id.toString(),
      });
      res.render("users/online-pay", {
        userId: req.session.user_id,
        order_id: razorpayOrder.id,
        total: req.body.amount,
        key_id: process.env.key_id,
        user: user,
        order: order,
        orderId: order._id.toString(),
      });
    } else if (req.body.payment == "WALLET") {
      console.log("nithin1");
      if (order.amount > user.wallet) {
        const totalAmount = order.amount - user.wallet;
        console.log("nithin2");

        order2 = new Order({
          userId: user._id,
          payment: req.body.payment,
          amount: rupees,
          payedAmount: user.wallet,
          address: address,
          products: user.cart,
        });
        await User.updateOne(
          { _id: user._id },
          {
            wallet: 0,
          }
        );

        var instance = new RazorPay({
          key_id: process.env.KEY_ID,
          key_secret: process.env.KEY_SECRET,
        });
        let razorpayOrder = await instance.orders.create({
          amount: totalAmount * 100,
          currency: "INR",
          receipt: order._id.toString(),
        });
        res.render("users/online-pay", {
          userId: req.session.user_id,
          order_id: razorpayOrder.id,
          total: totalAmount,
          key_id: process.env.key_id,
          user: user,
          order: order2,
          orderId: order._id.toString(),
        });
      } else {
        console.log("nithin3");
        const totalAmount = user.wallet - order.amount;
        console.log(totalAmount);
        order1 = new Order({
          userId: user._id,
          payment: req.body.payment,
          amount: rupees,
          payedAmount: order.amount,
          address: address,
          products: user.cart,
        });
        console.log(order1);

        await order1.save();
        await User.findByIdAndUpdate(
          { _id: user._id },
          {
            wallet: totalAmount,
          }
        );
        await User.updateOne(
          { _id: req.session.user },
          { $unset: { cart: 1 } }
        );
        res.render("users/success", { user: user });
      }
    } else {
      res.redirect("/checkOut");
    }
  } catch (error) {
    res.redirect("/error");
  }
};

const loadProfileAddress = async (req, res, next) => {
  try {
    const address = await Address.find({ userId: req.session.user.id }).sort({
      $natural: -1,
    });
    res.render("users/profileAddress", { address, user: req.session.user });
  } catch (error) {}
};

const saveProfileAddress = async (req, res, next) => {
  try {
    const addressData = new Address({
      userId: req.session.user.id,
      firstname: req.body.firstName,
      lastname: req.body.lastName,
      country: req.body.country,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      mobile: req.body.mobile,
    });

    await addressData.save();
    res.redirect("/profileAddress");
  } catch (error) {}
};

const deleteAddress = async (req, res) => {
  try {
    if (req.session.user) {
      const addressData = await Address.deleteOne({ _id: req.query.id });
      res.redirect("/profileAddress");
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect("/error");
  }
};

const loadOrderDetails = async function (req, res) {
  try {
    if (req.session.user) {
      const orderData = await Order.find({ userId: req.session.user_id }).sort({
        $natural: -1,
      });
      res.render("users/orderDetails", {
        user: req.session.user,
        orders: orderData,
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect("/error");
  }
};
const singleOrderDetails = async (req, res) => {
  try {
    const orderData = await Order.findOne({ _id: req.query.id }).populate(
      "userId"
    );
    const productData = await orderData.populate("products.item.productId");
    res.render("users/singleOrderDetails", {
      user: req.session.user,
      order: orderData,
      head: 5,
      products: productData.products,
    });
  } catch (error) {
    res.redirect("/error");
  }
};

const cancellOrder = async (req, res, next) => {
  try {
    const id = req.query.id;
    const orderDa = await Order.findOne({ _id: id });
    if (req.session.user) {
      const orderData = await Order.findByIdAndUpdate(
        { _id: id },
        {
          $set: { status: "Cancelled" },
        }
      );
      for (let x of orderDa.products.item) {
        await Product.updateOne(
          { _id: x.productId },
          { $inc: { stock: -x.qty } }
        );
      }
      const user = await User.findOne({ _id: req.session.user._id });
      console.log(user);
      req.session.user = user;

      if (orderDa.payment == "ONLINE" || orderDa.payment == "WALLET") {
        const walletAmout = user.wallet + orderDa.payedAmount;
        console.log(walletAmout);
        console.log(user.wallet, orderDa.payedAmount);

        await User.findByIdAndUpdate(
          { _id: user._id },
          {
            wallet: walletAmout,
          }
        );
      }

      res.redirect("/orderDetails");
    } else {
      res.redirect("/orderDetails");
    }
  } catch (error) {
    res.redirect("/error");
  }
};

const applyCoupon = async (req, res) => {
  try {
    const couponData = await Coupon.findOne({ name: req.body.name });
    res.send({ couponData });
  } catch (error) {
    res.redirect("/error");
  }
};

const saveOnline = async (req, res, next) => {
  try {
    for (let x of order.products.item) {
      await Product.updateOne(
        { _id: x.productId },
        { $inc: { stock: -x.qty } }
      );
    }
    order.payedAmount = order.amount;
    await order.save();
    await User.updateOne({ _id: req.session.user }, { $unset: { cart: 1 } });
    res.render("users/success", { user: req.session.user });
  } catch (error) {
    res.redirect("/error");
  }
};

const editAddress = async (req, res, next) => {
  try {
    console.log("function");
    if (req.session.user) {
      const id = req.query.id;
      console.log(id);
      const addressData = await Address.findByIdAndUpdate(
        { _id: id },
        {
          firstname: req.body.firstName,
          lastname: req.body.lastName,
          country: req.body.country,
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          zip: req.body.zip,
          mobile: req.body.mobile,
        }
      );
      console.log(addressData);

      res.redirect("/profileAddress");
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect("/error");
  }
};

const error = async (req, res, next) => {
  res.render("error/error");
};

const returnOrder = async (req, res, next) => {
  try {
    if (req.session.user) {
      const id = req.query.id;
      const orderDa = await Order.findOne({ _id: id });
      const orderData = await Order.findByIdAndUpdate(
        { _id: id },
        {
          $set: { status: "Returned" },
        }
      );
    }
    res.redirect("/orderDetails");
  } catch (error) {
    res.redirect("/error");
  }
};

const editImage = async (req, res, next) => {
  try {
    await User.updateOne(
      { _id: req.session.user_id },
      {
        $set: {
          profile: req.file.filename,
        },
      }
    );
    res.redirect("/profile");
  } catch (error) {
    res.redirect("/error");
  }
};

const forgetPassword2 = async (req, res, next) => {
  try {
    res.render("users/resetOtpNumberLogin", { user: req.session.user });
  } catch (error) {
    res.redirect("/error");
  }
};

const loadOtpVerification2 = async (req, res) => {
  try {
    const user = await User.find({ mobile: req.body.phone });

    console.log(user);
    const mobile = req.body.phone;
    console.log(mobile);

    if (user) {
      console.log(1);

      newOtp = fastSms.sendMessage(mobile, res);
      req.session.otp = newOtp;
      req.session.mob = mobile;
      console.log(newOtp);

      res.render("users/resetotp2", {
        user: req.session.user,
        mobile: mobile,
        message: "otp sent successfully",
      });
    } else {
      console.log(3);
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect("/error");
  }
};

const resendOtpVerification2 = async (req, res, next) => {
  try {
    newOtp = fastSms.sendMessage(req.session.mob, res);
    req.session.otp = newOtp;
    console.log(newOtp);
    // const userData = await User.find();
    res.render("users/resetotp2", {
      user: req.session.user,
      mobile: req.session.mob,
      message: "otp resent successfully",
    });
  } catch (error) {
    res.redirect("/error");
  }
};

const loadResetPassword2 = async (req, res, next) => {
  try {
    if (req.body.otp == req.session.otp) {
      res.render("users/resetPassword2", { user: req.session.user });
    } else {
      redirect("/otpVerification");
    }
  } catch (error) {
    res.redirect("/error");
  }
};

const passwordVerification2 = async (req, res, next) => {
  try {
    console.log("function");
    user1 = await User.findOne({ mobile: req.session.mob });
    console.log(1);
    const newPass = await bcrypt.hash(req.body.password, 10);
    console.log(2);
    const user = await User.findByIdAndUpdate(
      { _id: user1._id },
      {
        $set: {
          password: newPass,
        },
      }
    );
    console.log(3);
    res.redirect("/login");
  } catch (error) {
    res.redirect("/error");
  }
};

const saveOnline2 = async (req, res, next) => {
  try {
    for (let x of order.products.item) {
      await Product.updateOne(
        { _id: x.productId },
        { $inc: { stock: -x.qty } }
      );
    }

    order.payedAmount = order.amount;
    await order.save();
    await User.updateOne(
      { _id: user._id },
      {
        wallet: 0,
      }
    );
    await User.updateOne({ _id: req.session.user }, { $unset: { cart: 1 } });
    res.render("users/success", { user: req.session.user });
  } catch (error) {
    res.redirect("/error");
  }
};

module.exports = {
  loadHome,
  loadLogin,
  loadRegister,
  loadOTP,
  resendOtp,
  verifyOtp,
  logout,
  verifyLogin,
  loadProducts,
  loadProductDetail,
  loadWishList,
  addToWishList,
  deleteFromWishList,
  loadCart,
  loadProfile,
  loadAddress,
  addToCart,
  deleteCart,
  loadNumberVerification,
  loadOtpVerification,
  resendOtpVerification,
  loadResetPassword,
  passwordVerification1,
  loadEditProfile,
  changeUsername,
  updateCart,
  loadCheckOut,
  saveAddress,
  placeCod,
  loadProfileAddress,
  saveProfileAddress,
  deleteAddress,
  singleOrderDetails,
  loadOrderDetails,
  cancellOrder,
  applyCoupon,
  saveOnline,
  error,
  editAddress,
  returnOrder,
  editImage,
  forgetPassword2,
  loadOtpVerification2,
  resendOtpVerification2,
  loadResetPassword2,
  passwordVerification2,
  saveOnline2,
};
