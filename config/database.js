import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();

// Replace the URI with your actual MongoDB connection string.
// Use '127.0.0.1' instead of 'localhost' for local connections with newer Node.js versions.
const mongoDBUri = process.env.MONGO_URL; 

async function connectToMongoose() {
  try {
    await mongoose.connect(mongoDBUri);
    console.log('Connected to MongoDB successfully!');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1); // Exit process if the connection fails
  }
}

connectToMongoose();

// Optional: Listen for connection events after the initial connection
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error after initial connection:', err);
});

export default mongoose;
