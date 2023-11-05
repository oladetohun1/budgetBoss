// middleware/verifyToken.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { RevokedToken } from '../../server/models/rovokedToken.model.js';

dotenv.config();

export const verifyToken = async (req, res, next) => {
    const token = req.cookies.refreshToken || req.headers['x-refresh-token'];
    if (!token) {
      console.log('Token is missing or invalid');
      return res.status(401).send('Unauthorized');
    }
  
    const isTokenRevoked = await RevokedToken.findOne({ token });
    if (isTokenRevoked) {
      console.log('Token is revoked');
      return res.status(403).send('Forbidden');
    }
  
    jwt.verify(token, process.env.REFRESH_TOKEN, (err, user) => {
      if (err) {
        console.log('Token verification failed:', err);
        return res.status(403).send('Forbidden');
      }
      req.user = user;
      next();
    });
  };
  

export default verifyToken;
