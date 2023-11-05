import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const dbUrl = process.env.MONGO_URL || "";

// connect to database
const connectDB = async () => {
  try {
    await mongoose
      .connect(dbUrl, { serverSelectionTimeoutMS: 30000 })
      .then((data) => {
        console.log(`Database connected to ${data.connection.host}`);
      });
  } catch (err) {
    console.log(err.message);
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
