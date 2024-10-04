// controllers/FilesController.js

import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';

class FilesController {
  // Handle POST /files (file creation)
  static async postUpload(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if ((type === 'file' || type === 'image') && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Validate parentId if provided
    if (parentId !== 0) {
      const db = dbClient.client.db(dbClient.dbName);
      const parentFile = await db.collection('files').findOne({ _id: parentId });

      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    // Prepare file object for insertion into DB
    const newFile = {
      userId,
      name,
      type,
      isPublic,
      parentId: parentId || 0,
    };

    const db = dbClient.client.db(dbClient.dbName);

    // If type is 'folder', save the document in DB and return it
    if (type === 'folder') {
      const result = await db.collection('files').insertOne(newFile);
      return res.status(201).json({ id: result.insertedId, ...newFile });
    }

    // Handle file or image
    try {
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      await fs.mkdir(folderPath, { recursive: true }); // Ensure folder exists

      const localPath = path.join(folderPath, uuidv4());
      const fileData = Buffer.from(data, 'base64');
      await fs.writeFile(localPath, fileData); // Save the file

      // Add localPath to the newFile document
      newFile.localPath = localPath;

      // Save file document in DB
      const result = await db.collection('files').insertOne(newFile);

      // Return the newly created file object
      return res.status(201).json({
        id: result.insertedId,
        ...newFile,
      });
    } catch (error) {
      console.error('File saving error:', error);
      return res.status(500).json({ error: 'Error saving the file' });
    }
  }
}

export default FilesController;
