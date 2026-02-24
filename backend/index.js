process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { PORT } = require('./src/config');
const AppError = require('./src/utils/AppError');
const globalErrorHandler = require('./src/middleware/errorMiddleware');
const connectDB = require('./src/models/dbConnection');
const routes = require('./src/routes');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
    res.send("OK");
});

app.use('/api', routes);

// Unknown Routes Handler
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

const startServer = async () => {
    await connectDB();
    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();

process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
