import mongoose from "mongoose";

 export const connectDB=async()=>{
    await mongoose.connect('mongodb+srv://aamir73690:b147g0hbrf0TuKP3@food-delivery.snqbhub.mongodb.net/food-delivery').then(()=>console.log("DB connected"))
}