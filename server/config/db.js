const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("⏳ Attempting to connect to MongoDB...");
    
    const uri = process.env.MONGO_URI;
    
    if (!uri) {
      throw new Error("MONGO_URI is not defined in .env file");
    }
    
    // Log URI partially for debugging (hide password)
    const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
    console.log("📡 Connecting to:", maskedUri);
    
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    
    // More helpful error messages
    if (error.message.includes('bad auth')) {
      console.log("   → Check your username and password");
    } else if (error.message.includes('getaddrinfo')) {
      console.log("   → Check your cluster name");
    } else if (error.message.includes('timed out')) {
      console.log("   → Network issue - check your internet/whitelist IP");
    } else if (error.message.includes('port number')) {
      console.log("   → This error is misleading. Your URI format is correct.");
      console.log("   → The issue might be with network access or credentials.");
    }
    
    return false;
  }
};

module.exports = connectDB;