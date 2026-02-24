const { NODE_ENV } = require('../config');
const AppError = require('../utils/AppError');

const handleDuplicateKeyError = (err) => {
    const key = Object.keys(err.keyValue)[0];
    const value = err.keyValue[key];
    const message = `${key.charAt(0).toUpperCase() + key.slice(1)} '${value}' already exists. Please use another one.`;
    return new AppError(message, 400);
};

const handleJWTError = () =>
    new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
    new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    // Programming or other unknown error: don't leak error details
    else {
        console.error('ERROR 💥', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (NODE_ENV === 'development') {
        let error = err; // Use direct reference for dev

        if (error.code === 11000) error = handleDuplicateKeyError(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorDev(error, res);
    } else {
        let error = { ...err };
        error.message = err.message;

        if (error.code === 11000) error = handleDuplicateKeyError(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};
