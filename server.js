import app from "./app.js";
import connectDB from "./config/mongodb.js";

const PORT = process.env.PORT || 5000;

// ✅ Ensures DB is ready BEFORE server starts
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1); // ⛔ Exit app if DB failed
  });
