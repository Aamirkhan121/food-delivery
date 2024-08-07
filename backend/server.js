import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import{ cartRouter,orderRouter,userRouter } from "./routes/userRoute.js";
import "dotenv/config";


// app config

const app = express();
const port =process.env.PORT || 4000;

// middleware
app.use(express.json());
app.use(cors());

//DB Connection
connectDB();

//api endpoint
app.use("/api/food", foodRouter);
app.use("/images", express.static("uploads"));
app.use("/api/user",userRouter);
app.use("/api/cart",cartRouter);
app.use("/api/order",orderRouter);



app.get("/", (req, res) => {
  res.send("API Working");
});

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`);
});

//mongodb+srv://aamir73690:7369041570@cluster0.bymdznb.mongodb.net/?
