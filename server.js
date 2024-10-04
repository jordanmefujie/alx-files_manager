// utils/db.js

import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

config(); // Load environment variables from .env file

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.dbName = database;

    this.client.connect().catch((err) => {
      console.error('MongoDB connection error:', err);
    });
  }

  // Check if the connection is alive
  isAlive() {
    return this.client.isConnected();
  }

  // Get the number of users in the 'users' collection
  async nbUsers() {
    const db = this.client.db(this.dbName);
    return db.collection('users').countDocuments();
  }

  // Get the number of files in the 'files' collection
  async nbFiles() {
    const db = this.client.db(this.dbName);
    return db.collection('files').countDocuments();
  }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
