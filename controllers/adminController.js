const User = require("../models/userModel");
const Category = require("../models/category");
const Product = require("../models/product");
const bcrypt = require("bcrypt");
const Coupons = require("../models/coupon");
const Banner = require("../models/banner");
const Order = require("../models/orders");
const { findByIdAndUpdate } = require("../models/product");

const loadLogin = async (req, res, next) => {
  try {
    res.render("admin/login");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res, next) => {
  try {
    const password = req.body.password;
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
console.log(userData)
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      console.log(passwordMatch);
      console.log("you had entered the function");
      if (passwordMatch) {
        if (userData.is_admin === 0) {
          res.render("admin/login");
        } else {
          console.log("you are logged in successfully");
          req.session.admin_id = userData._id;
          console.log("nithin")
          res.redirect("admin/dashboard");
        }
      } else {
        res.render("admin/login", {
          message: "email and password is incorrect",
        });
      }
    } else {
      res.render("admin/login", { message: "email and password is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadDashboard = async (req, res) => {
  try {
    const orderData = await Order.find().populate("userId");
    const productData = await Order.find().populate("products.item.productId");

    let product = [];
    let ods = [];

    productData.map((x) => {
      for (let key of x.products.item) {
        const isExisting = product.findIndex((index) => {
          console.log("index",index);
          return key.productId?.name == index;
        });
        if (isExisting == -1) {
          console.log("nithin");
          
          product.push(key.productId?.name);
          ods.push(key.qty);
        } else {
          console.log("ods", ods);
          ods[isExisting] += key.qty;
        }
      }
    });
    console.log("abhirami");
    let arr = [],
      dt = [];
    let totRev = 0;
    let op = 0;
    let cod = 0;
    orderData.map((x) => {
      let date = new Date(x.createdAt).getDate();
      arr = [...arr, x.amount];
      dt = [...dt, date];
      if (x.payment == "COD") {
        cod += x.amount;
      } else {
        op += x.amount;
      }
      totRev += x.amount;
    });

    const products = await Product.find();
    let pds = [],
      qty = [];
    products.map((x) => {
      console.log("x", x.name);
      pds = [...pds, x.name];
      qty = [...qty, x.stock];
    });
    orderData.ma;

    res.render("admin/dashboard", {
      pds,
      qty,
      orderData,
      arr,
      dt,
      totRev,
      product,
      ods,
      cod,
      op,
      active: 1,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const logout = async (req, res) => {
  try {
    console.log("logOUt");
    req.session.admin = null;
    res.render("admin/login");
  } catch (error) {
    console.log(error.message);
  }
};

const loadUsers = async (req, res) => {
  try {
    var search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const userData = await User.find({
      is_admin: 0,
      $or: [
        { name: { $regex: ".*" + search + ".*" } },
        { email: { $regex: ".*" + search + ".*" } },
        { mobile: { $regex: ".*" + search + ".*" } },
      ],
    });
    res.render("admin/users", { users: userData, val: search, active: 2 });
  } catch (error) {
    console.log(error.message);
  }
};
const blockUser = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findOne({ _id: id });
    console.log(id);
    if (userData.is_verified) {
      const userData = await User.findByIdAndUpdate(
        { _id: id },
        { $set: { is_verified: 0 } }
      );
      console.log("blocked " + userData.name);
      state = 0;
    } else {
      await User.findByIdAndUpdate({ _id: id }, { $set: { is_verified: 1 } });
      console.log("unblocked " + userData.name);
      state = 1;
    }
    res.send({ state });
  } catch (error) {
    console.log(error);
  }
};

const loadCategory = async (req, res) => {
  try {
    var search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const categoryData = await Category.find({
      name: { $regex: ".*" + search + ".*" },
    });
    res.render("admin/category", {
      category: categoryData,
      val: search,
      message: undefined,
      active: 3,
    });
  } catch (error) {
    console.log(error);
  }
};

const addCategory = async (req, res) => {
  console.log(req.body);
  try {
    let arr = [];
    const categoryData = await Category.find();
    categoryData.map((x) => {
      arr.push(x.name.toUpperCase());
    });
    const category = req.body.name.toUpperCase();
    const isExisting = arr.findIndex((x) => x == category);
    if (isExisting != -1) {
      state = 0;
    } else {
      state = 1;
      if (req.body.edit) {
        await Category.updateOne(
          { _id: req.body.id },
          { $set: { name: req.body.name } }
        );
      } else {
        const cat = new Category({ name: req.body.name });
        cat.save();
      }
    }
    res.send({ state });
  } catch (error) {
    console.log(error);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = req.query.id;
    await Category.deleteOne({ _id: id });
    res.redirect("category");
  } catch (error) {
    console.log(error);
  }
};
const listCategory = async (req, res) => {
  try {
    const id = req.body.id;
    console.log(id);
    let categoryData;
    const category = await Category.findOne({ _id: id });
    if (category.isAvailable) {
      categoryData = await Category.findByIdAndUpdate(
        { _id: id },
        { $set: { isAvailable: 0 } }
      );
      state = 0;
    } else {
      categoryData = await Category.findByIdAndUpdate(
        { _id: id },
        { $set: { isAvailable: 1 } }
      );
      state = 1;
    }
    res.send({ state });
  } catch (error) {
    console.log(error);
  }
};
const loadProducts = async (req, res) => {
  try {
    const productData = await Product.find();
    res.render("admin/product", { products: productData, active: 4 });
  } catch (error) {
    console.log(error.message);
  }
};
const loadAddProducts = async (req, res) => {
  try {
    const categoryData = await Category.find();
    res.render("admin/addProducts", {
      category: categoryData,
      message: null,
      active: 4,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const addProduct = async (req, res) => {
  try {
    const categoryData = await Category.find();

    console.log(req.body.category, 1);
    const productCategory = await Category.findOne({ name: req.body.category });

    const offer = productCategory.offer;

    const finalPrice = parseInt(req.body.price);

    const price = parseInt(finalPrice - (finalPrice * offer) / 100);

    if (req.files.length != 0) {
      const product = Product({
        name: req.body.name,
        price: price,
        description: req.body.description,
        stock: req.body.stock,
        category: req.body.category,
        offer: offer,
        finalPrice: finalPrice,

        image: req.files.map((x) => x.filename),
      });

      await product.save();
      const productData = await Product.find();
      if (product) {
        res.render("admin/product", {
          message: "registration successfull.",
          products: productData,
          active: 4,
        });
      } else {
        res.render("admin/addProducts", {
          message: "registration failed",
          category: categoryData,
          active: 4,
        });
      }
    } else {
      res.render("admin/addProducts", {
        message:
          "registration failed only jpg ,jpeg, webp & png file supported !",
        category: categoryData,
        active: 4,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const loadEditProducts = async (req, res) => {
  try {
    const categoryData = await Category.find();
    const productData = await Product.findOne({ _id: req.query.id });
    res.render("admin/editProduct", {
      product: productData,
      category: categoryData,
      active: 4,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const updateImage = async (req, res) => {
  try {
    let { pId, img } = req.body;
    console.log(pId, img);
    await Product.updateOne({ _id: pId }, { $pull: { image: img } });
    const productData = Product.findOne({ _id: pId });
    console.log(productData);
    res.send({ newImage: productData.image });
  } catch (error) {
    console.log(error.message);
  }
};
const uploadImage = async (req, res) => {
  try {
    console.log(req.files);
    const productDetails = await Product.findOne({ _id: req.body.pId });
    const oldImg = productDetails.image;
    const newImg = req.files.map((x) => x.filename);
    const images = oldImg.concat(newImg);
    console.log(images);
    await Product.updateOne({ _id: req.body.pId }, { $set: { image: images } });
    const productData = await Product.findOne({ _id: req.body.pId });
    console.log(productData.image);
    res.json({ newImage: productData.image });
  } catch (error) {
    console.log(error.message);
  }
};

const editProduct = async (req, res) => {
  try {
    console.log(req.files);
    const category = await Category.findOne({ name: req.body.category });

    const offer = category.offer;

    const finalPrice = req.body.price;

    const price = parseInt(finalPrice - (finalPrice * offer) / 100);

    if (req.files.length != 0) {
      const productDetails = await Product.findOne({ _id: req.query.id });
      const oldImg = productDetails.image;
      const newImg = req.files.map((x) => x.filename);
      const images = oldImg.concat(newImg);
      console.log(images);
      product = await Product.updateOne(
        { _id: req.query.id },
        {
          $set: {
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            stock: req.body.stock,
            category: req.body.category,
            image: images,
            finalPrice: finalPrice,
          },
        }
      );
    } else {
      product = await Product.updateOne(
        { _id: req.query.id },
        {
          $set: {
            name: req.body.name,
            price: price,
            description: req.body.description,
            stock: req.body.stock,
            category: req.body.category,
            finalPrice: finalPrice,
          },
        }
      );
    }
    console.log(product);
    const productData = await Product.find();
    if (productData) {
      res.render("admin/product", {
        message: "registration successfull.",
        products: productData,
        active: 4,
      });
    } else {
      res.render("admin/product", {
        message: "registration failed",
        products: productData,
        active: 4,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const deleteProduct = async (req, res) => {
  try {
    await Product.deleteOne({ _id: req.query.id });
    res.redirect("products");
  } catch (error) {
    console.log(error.message);
  }
};

const loadBanner = async (req, res) => {
  try {
    const bannerData = await Banner.find();
    res.render("admin/banners", { active: 6, val: "", banner: bannerData });
  } catch (error) {}
};
const addBanner = async (req, res) => {
  try {
    const banner = new Banner({
      name: req.body.name,
      image: req.files.map((x) => x.filename),
    });
    await banner.save();
    res.redirect("/admin/banners");
  } catch (error) {
    console.log(error.message);
  }
};
const editBanner = async (req, res) => {
  try {
    const id = req.body.id;
    if (req.file) {
      fields = {
        name: req.body.name,

        image: req.files.map((x) => x.filename),
      };
    } else {
      fields = {
        name: req.body.name,
      };
    }
    bannerData = await Banner.findByIdAndUpdate({ _id: id }, { $set: fields });
    res.redirect("/admin/banners");
  } catch (error) {
    console.log(error.message);
  }
};
// const listBanner = async (req, res) => {
//   try {
//     const id = req.body.id
//     const coupon = await Banner.findOne({ _id: id });
//     if (coupon.isAvailable) {
//        await Banner.findByIdAndUpdate({ _id: id }, { $set: { isAvailable: 0 } });
//        state=0
//     } else {
//        await Banner.findByIdAndUpdate({ _id: id }, { $set: { isAvailable: 1 } })
//        state=1
//   }
//     res.send({state})
//   } catch (error) {
//     console.log(error);
//   }
// }

const listBanner = async (req, res, next) => {
  try {
    console.log("hey i  am nithin");
    const id = req.body.id;
    console.log(id);
    let bannerData = await Banner.findOne({ _id: id });
    if (bannerData.is_active) {
      bannerData = await Banner.findByIdAndUpdate(
        { _id: id },
        { $set: { is_active: 0 } }
      );
      state = 0;
    } else {
      bannerData = await Banner.findByIdAndUpdate(
        { _id: id },
        { $set: { is_active: 1 } }
      );
      state = 1;
    }
    res.send({ state });
    console.log(state);
  } catch (error) {
    console.log(error.message);
  }
};

const deleteBanner = async (req, res) => {
  try {
    const id = req.query.id;
    await Banner.deleteOne({ _id: id });
    res.redirect("banners");
  } catch (error) {
    console.log(error);
  }
};

const loadCoupon = async (req, res) => {
  try {
    const couponData = await Coupons.find();
    res.render("admin/coupon", {
      message: undefined,
      active: 5,
      val: "",
      coupon: couponData,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const addCoupon = async (req, res) => {
  try {
    let { name, discount, maxDiscount, minValue } = req.body;
    const coupon = new Coupons({
      name: name,
      discount: discount,
      max: maxDiscount,
      min: minValue,
    });
    await coupon.save();
    res.redirect("coupons");
  } catch (error) {
    console.log(error.message);
  }
};
const editCoupon = async (req, res) => {
  try {
    let { id, name, discount, maxDiscount, minValue } = req.body;
    await Coupons.updateOne(
      { _id: id },
      {
        $set: {
          name: name,
          discount: discount,
          max: maxDiscount,
          min: minValue,
        },
      }
    );
    res.redirect("coupons");
  } catch (error) {
    console.log(error.message);
  }
};
const listCoupon = async (req, res) => {
  try {
    const id = req.body.id;
    console.log(id);
    let couponData;
    const coupon = await Coupons.findOne({ _id: id });
    if (coupon.isAvailable) {
      couponData = await Coupons.findByIdAndUpdate(
        { _id: id },
        { $set: { isAvailable: 0 } }
      );
      state = 0;
    } else {
      couponData = await Coupons.findByIdAndUpdate(
        { _id: id },
        { $set: { isAvailable: 1 } }
      );
      state = 1;
    }
    res.send({ state });
  } catch (error) {
    console.log(error);
  }
};

const loadOrders = async (req, res) => {
  try {
    const orderData = await Order.find({})
      .populate("userId")
      .sort({ $natural: -1 });
    res.render("admin/orders", {
      message: undefined,
      active: 7,
      val: "",
      orders: orderData,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const loadOrderDetails = async (req, res) => {
  try {
    const orderData = await Order.findOne({ _id: req.query.id }).populate(
      "userId"
    );
    const userData = await orderData.populate("userId");
    const productData = await orderData.populate("products.item.productId");
    res.render("admin/orderDetails", {
      message: undefined,
      active: 7,
      val: "",
      order: orderData,
      user: userData,
      products: productData.products,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const changeStatus = async (req, res) => {
  try {
    console.log("hiiiiiiiiiiiiiiiiiiiiiiii");
    await Order.updateOne({ _id: req.body.id }, { status: req.body.status });
    const orderData = await Order.findOne({ _id: req.body.id });
    console.log(req.body.status, orderData.payment);
    if (req.body.status == "Cancelled" && orderData.payment != "COD") {
      const userData = await User.findOne({ _id: orderData.userId });
      await User.updateOne(
        { _id: orderData.userId },
        { $set: { wallet: userData.wallet + orderData.amount } }
      );
      console.log("ipadde" + userData, userData.wallet);
    }
    if (orderData) {
      console.log(orderData);
      res.send({ state: 1 });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addOffer = async (req, res, next) => {
  try {
    const id = req.body.id;

    const categoryData = await Category.findOne({ _id: id });
    console.log(categoryData);
    const offer = parseInt(req.body.offer);
    console.log(offer, 3);

    const category = await Category.findByIdAndUpdate(
      {
        _id: id,
      },
      { offer: offer }
    );

    const productData = await Product.find({ category: categoryData.name });
    console.log(productData);

    for (i = 0; i < productData.length; i++) {
      await Product.findByIdAndUpdate(
        { _id: productData[i]._id },
        { offer: offer }
      );

      finalPrice = productData[i].finalPrice;

      console.log(productData[i].name);

      const price = finalPrice - (finalPrice * offer) / 100;
      console.log(price);

      const product = await Product.findByIdAndUpdate(
        { _id: productData[i]._id },
        {
          price: price,
        }
      );
      console.log("end");
    }

    res.redirect("/admin/category");
  } catch (error) {}
};

module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  logout,
  blockUser,
  loadUsers,
  loadProducts,
  loadAddProducts,
  loadEditProducts,
  editProduct,
  updateImage,
  uploadImage,
  addProduct,
  deleteProduct,
  loadCategory,
  addCategory,
  listCategory,
  deleteCategory,
  loadCoupon,
  addCoupon,
  editCoupon,
  listCoupon,
  loadBanner,
  addBanner,
  editBanner,
  listBanner,
  deleteBanner,
  loadOrders,
  loadOrderDetails,
  changeStatus,
  addOffer,
};
