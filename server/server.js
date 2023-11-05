// create the server
import app from './app.js';
import dotenv from 'dotenv';
import colors from 'colors';
import connectDB from './config/connectDb.js';
dotenv.config();

// PORT
const PORT = process.env.PORT || 8000;

// listen to the port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`.yellow.bold);
    connectDB();
});

