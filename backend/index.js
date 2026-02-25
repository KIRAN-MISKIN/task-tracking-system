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

// Request logger
app.use((req, res, next) => {
    console.log(`\n--- ${new Date().toISOString()} ---`);
    console.log(`${req.method} ${req.originalUrl}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', JSON.stringify(req.body, null, 2));
    }

    // Capture the original send to log response status and error messages
    const oldSend = res.send;
    res.send = function (data) {
        console.log(`Response: ${res.statusCode}`);

        // If it's an error (4xx or 5xx), try to log the message
        if (res.statusCode >= 400 && data) {
            try {
                const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
                if (parsedData && parsedData.message) {
                    console.log(`Error Message: ${parsedData.message}`);
                }
            } catch (e) {
                // If not JSON or can't be parsed, just quiet
            }
        }
        return oldSend.apply(res, arguments);
    };

    next();
});

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
