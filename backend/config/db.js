import mongoose from "mongoose";
import dns from "dns";

// Use public DNS resolvers to prevent ECONNREFUSED on MongoDB SRV records in Node.js
dns.setServers(["8.8.8.8", "1.1.1.1"]);

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB CONNECTED");
    } catch (err) {
        console.error("DB connection error:", err);
        process.exit(1);
    }
}