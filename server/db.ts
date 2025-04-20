import mongoose from 'mongoose';

// MongoDB connection string
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb+srv://admin:Sshiv12345@cluster0.4fs9ylv.mongodb.net/newecom';

// Connect to MongoDB
export async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Close MongoDB connection
export async function closeDatabaseConnection() {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
}

export default mongoose;