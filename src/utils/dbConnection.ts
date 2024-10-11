import mongoose from "mongoose";

// const uri: string = 'mongodb://127.0.0.1:27017/harman-spare-parts'; 
const uri: string | undefined = process.env.MONGO_URI;
async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(uri!);
    console.log(">>>>>>>>>>> db connected");
  } catch (error: any) {
    console.error("Error connecting to the database:", error.message);
  }
}

export { connectDB };
