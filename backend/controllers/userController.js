import userModle from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import orderModle from "../models/orderModle.js";
import Stripe from "stripe";


//login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email & password is required",
      });
    }
    const user = await userModle.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "user doesn't exists " });
    }
    
    //check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      //this value is false and then throw this response
      return res.json({ success: false, message: "Invalid credentails" });
    }
    const token = createToken(user._id);
    if (isMatch) {
      res.status(200).json({
        message: "Login Successfully",
        success: true,
        token,
        userId: user._id.toString(),
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "ERROR" });
  }
};

//registerUser

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    //checking is user already exists
    const exists = await userModle.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }
    //validating email format and strong password
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }
    
    //hashing password
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = new userModle({
      name: name,
      email: email,
      password: hashedPassword,
    });
    
    const user = await newUser.save();
    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "ERROR" });
  }
};

//Cart controller

//add items to user cart
const addToCart = async (req, res) => {
  try {
    let userData = await userModle.findById(req.body.userId); //UserId is coming from middleware
    let cartData = await userData.cartData;
    if (!cartData[req.body.itemId]) {
      cartData[req.body.itemId] = 1;
    } else {
      cartData[req.body.itemId] += 1;
    }
    await userModle.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({ success: true, message: "Add To Cart" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "ERROR" });
  }
};
//remove items to user cart
const removeFromCart = async (req, res) => {
  try {
    let userData = await userModle.findById(req.body.userId); //UserId is coming from middleware
    let cartData = await userData.cartData;
    if (cartData[req.body.itemId] > 0) {
      cartData[req.body.itemId] -= 1;
    }
    await userModle.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({ success: true, message: "Remove From Cart" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "ERROR" });
  }
};
//fetch user cart data
const getCart = async (req, res) => {
  try {
    let userData = await userModle.findById(req.body.userId); //UserId is coming from middleware
    let cartData = await userData.cartData;
    res.json({success:true,cartData});        
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "ERROR" });        
  }
};

//cart controller end


//order controller start



const stripe=new Stripe(process.env.STRIPE_SECRET_KEY)
//placing user order for online-order

const placeOrder=async (req,res)=>{
  const frontend_url="http://localhost:5173";
  try {
    const newOrder=new orderModle({
      userId:req.body.userId,
      items:req.body.items,
      amount:req.body.amount,
      address:req.body.address,
    })
    await newOrder.save()
    await userModle.findByIdAndUpdate(req.body.userId,{cartData:{}});

    const line_items=req.body.items.map((item)=>({
      price_data:{
        currency:"Us",
        product_data:{
          name:item.name
        },
        unit_amount:item.price*100*80
      },
      quantity:item.quantity
    }))
    line_items.push({
      price_data:{
        currency:"inr",
        product_data:{
          name:"Delivery Charges"
        },
        unit_amount:2*100*80,
      },
      quantity:1
    })

    const session = await stripe.checkout.sessions.create({
      line_items:line_items,
      mode:'payment',
      success_url:`${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url:`${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    })
    
    res.json({success:true,session_url:session.url})
  } catch (error) {
    console.log(error)
    res.json({success:false,message:"ERROR"})
  
  }

}

//order controller end


export { loginUser, registerUser, addToCart, removeFromCart, getCart,placeOrder};
