import express from "express";
import { addToCart, getCart, loginUser,registerUser, removeFromCart,placeOrder } from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";


const cartRouter=express.Router();

cartRouter.post("/add",authMiddleware,addToCart)
cartRouter.post("/remove",authMiddleware,removeFromCart)
cartRouter.post("/get",authMiddleware,getCart)


const userRouter=express.Router();

userRouter.post("/register",registerUser);
userRouter.post("/login",loginUser);



const orderRouter=express.Router();

orderRouter.post("/place",authMiddleware,placeOrder);

export {userRouter,cartRouter,orderRouter};