import express from "express";
import {login, register, logout, refresh } from "../controllers/user.controllers.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.post("/login", login);
userRouter.post("/register", register);
userRouter.put("/logout", verifyToken, logout);
userRouter.post("/refresh", refresh);

export default userRouter;
