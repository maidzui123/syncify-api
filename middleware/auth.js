import jwt from "jsonwebtoken";
import sendResponse from "../helper/sendResponse.helper.js";
import dotenv from 'dotenv'
dotenv.config();

const authentication = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) {
        return sendResponse({ res, status: 401, message: 'Access Denied' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
          return sendResponse({ res, status: 403, message: 'Invalid Token' });
        }
        req.user = user._id;
        next();
      });
}
export default authentication;