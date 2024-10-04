// controllers/AppController.js

import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

class AppController {
  // Handle the /status endpoint
  static async getStatus(req, res) {
    const redisAlive = redisClient.isAlive();
    const dbAlive = dbClient.isAlive();

    res.status(200).json({ redis: redisAlive, db: dbAlive });
  }

  // Handle the //stats endpoint
  static async getStats(req, res) {
    const usersCount = await dbClient.nbUsers();
    const filesCount = await dbClient.nbFiles();

    res.status(200).json({ users: usersCount, files: filesCount });
  }
}

export default AppController;
