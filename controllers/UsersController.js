// controllers/UsersController.js

import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';

class UsersController {
  // Handle GET /users/me (get authenticated user info)
  static async getMe(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tokenKey = `auth_${token}`;
    const userId = await redisClient.get(tokenKey);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve the user from the database
    const db = dbClient.client.db(dbClient.dbName);
    const user = await db.collection('users').findOne({ _id: new dbClient.ObjectID(userId) });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    res.status(200).json({ id: user._id, email: user.email });
  }
}

export default UsersController;
