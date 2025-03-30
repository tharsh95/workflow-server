import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Workflow } from '../models/Workflow.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

const cleanupIds = async () => {
  try {
    console.log('Starting ID cleanup...');
    
    // This will update all existing workflows, removing the id field
    // and ensuring the _id is converted to id in response objects
    const result = await mongoose.connection.db.collection('workflows').updateMany(
      {}, // Match all documents
      { $unset: { id: "" } } // Remove the id field
    );
    
    console.log(`Cleanup complete! Modified ${result.modifiedCount} documents.`);
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning up IDs:', error);
    process.exit(1);
  }
};

// Run the cleanup function
cleanupIds(); 