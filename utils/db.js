// utils/db.js

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${host}:${port}`;

    this.client = new MongoClient(uri, { useUnifiedTopology: true });
    this.dbName = database;

    // Connect to the MongoDB client
    this.client.connect()
      .then(() => {
        console.log('MongoDB connected successfully');
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err);
      });
  }

  // Check if MongoDB connection is alive
  isAlive() {
    return this.client.isConnected();
  }

  // Get the number of documents in the 'users' collection
  async nbUsers() {
    try {
      const db = this.client.db(this.dbName);
      const usersCount = await db.collection('users').countDocuments();
      return usersCount;
    } catch (error) {
      console.error('Error fetching user count:', error);
      return 0;
    }
  }

  // Get the number of documents in the 'files' collection
  async nbFiles() {
    try {
      const db = this.client.db(this.dbName);
      const filesCount = await db.collection('files').countDocuments();
      return filesCount;
    } catch (error) {
      console.error('Error fetching file count:', error);
      return 0;
    }
  }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
