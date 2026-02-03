import mongoose from "mongoose";
import { LOCAL_DATABASE_URI, REMOTE_DATABASE_URI } from "../config";

export const connectDB = async () => {
    try{
        await mongoose.connect(LOCAL_DATABASE_URI);
        console.log("MongoDB connected!");
    }catch(error){
        console.error("MongoDB connection error:", error);
        process.exit(1); // Exit process with failure
    }
}
// export const connectDBTest = async () => {
//     const testUri = MONGO_URI + "_test"; // Use a separate test database
//     try{
//         await mongoose.connect(testUri);
//         console.log("MongoDB Test Database connected!");
//     }catch(error){
//         console.error("Database error:", error);
//         process.exit(1); // Exit process with failure
//     }
// }