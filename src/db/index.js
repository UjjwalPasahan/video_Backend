import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionString = `${process.env.MONGODB_URI}/${DB_NAME}`;
        const connectionInstance = await mongoose.connect(connectionString)
        console.log(`mongodb connected on 8000`)
    } catch (error) {
        console.error("ERROR :: ",error);
        process.exit(1);
    }
}

export default connectDB;