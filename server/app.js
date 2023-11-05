import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const app = express();
import cors from 'cors';
// const morgan = require("morgan");
import Color from 'colors';
import cookieParser from 'cookie-parser';
import userRouter from '../server/routes/user.routes.js';


// body parser
app.use(express.json());

// cookie parser
app.use(cookieParser());

// cors
app.use(
    cors({
      origin: ["http://localhost:3000"],
      credentials: true,
    })
  );



// routes
app.use(
    "/api/v1",
    userRouter,
  );


// test route
app.get("/", (req, res) => {
    res.send("Hello from server");
});

// unknown route handler
app.all("*", (req, res, next) => {
    res.status(404).send("Route not found");

});

// error handler
app.use((error, req, res, next) => {
    res.status(error.status || 500).send({
        message: error.message,
        stack: error.stack,
    });
});


export default app;