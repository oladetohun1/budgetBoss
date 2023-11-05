import { RevokedToken } from "../models/rovokedToken.model.js";
import User from "../../server/models/user.model.js";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";

export const register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Check if a user with the same username already exists
    const existingUsernameUser = await User.findOne({ username });
    if (existingUsernameUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    // Check if a user with the same email already exists
    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    // If no existing user with the same username or email, proceed with registration
    const user = new User({ name, username, email, password });
    await user.save();
    // The code for saving the user to the database is placed within this conditional block
    // This ensures the user is only saved if no errors occurred
    if (!user.isNew) {
      // After saving the user, generate an access token and send it in the response
      const accessToken = user.signAccessToken();

      // Generate a refresh token, sign it, and save it to the user's refreshTokens array
      const refreshToken = user.signRefreshToken();

      // Save the updated user document with the new refresh token
      await user.save();

      // Set both tokens as cookies in the response
      res.cookie("accessToken", accessToken, { httpOnly: true });
      res.cookie("refreshToken", refreshToken, { httpOnly: true });

      res.status(201).send({
        accessToken,
        success: true,
        message: "User registered",
      });
    } else {
      res.status(500).send({ error: "Registration failed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if a user with the same email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send("Invalid credentials");
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).send("Invalid credentials");
    }

    // Generate an access token and a refresh token for the user
    const accessToken = user.signAccessToken();
    const refreshToken = user.signRefreshToken();

    // Save the updated user document with the new refresh token
    await user.save();

    // Set both tokens as cookies in the response
    res.cookie("accessToken", accessToken, { httpOnly: true });
    res.cookie("refreshToken", refreshToken, { httpOnly: true });

    res.status(200).send("Logged in");
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Login failed" });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear both cookies to log the user out

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken && !refreshToken) {
      // Both tokens are missing, which means the user is already logged out
      return res.status(200).send("User is already logged out");
    }

    if (accessToken) {
      await RevokedToken.create({ token: accessToken });
    }
    if (refreshToken) {
      await RevokedToken.create({ token: refreshToken });
    }

    res.status(200).send("Logged out");
  } catch (error) {
    console.error(error);
    res.status(500).send("Logout failed");
  }
};

export const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).send("No refresh token provided");
  }

  try {
    const response = await fetch(
      `${process.env.UPSTASH_URL}/get?k=${refreshToken}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      return res.status(401).send("Invalid refresh token");
    }

    const { userId } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);

    // Generate a new access token for the user
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });

    // Set the new access token as a cookie in the response
    res.cookie("accessToken", accessToken, { httpOnly: true });

    res.status(200).send("Access token refreshed");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error refreshing access token");
  }
};

export default { register, login, logout, refresh };
