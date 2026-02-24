const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV } = require('../config');

const signToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + 24 * 60 * 60 * 1000 // Placeholder for 1 day, ideally use a config
        ),
        httpOnly: true,
        secure: NODE_ENV === 'production'
    };

    res.cookie('jwt', token, cookieOptions);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.register = catchAsync(async (req, res, next) => {
    const { name, email, password, profilePicture, bio, role } = req.body;

    if (!name || !email || !password) {
        return next(new AppError('Please provide name, email and password!', 400));
    }

    const newUser = await User.create({
        name,
        email,
        password,
        profilePicture,
        bio,
        role
    });

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // 3) Update isLoggedin status
    user.isLoggedin = true;
    await user.save({ validateBeforeSave: false });

    // 4) If everything ok, send token to client
    createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
    // 1. Update user isLoggedin status in DB
    await User.findByIdAndUpdate(req.user.id, { isLoggedin: false });

    // 2. Clear cookie
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        status: 'success',
        message: 'Successfully logged out'
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(
            new AppError('You are not logged in! Please log in to get access.', 401)
        );
    }

    // 2) Verification token
    const decoded = await require('util').promisify(jwt.verify)(token, JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError(
                'The user belonging to this token does no longer exist.',
                401
            )
        );
    }

    // 4) Check if user is logged in (Session check)
    if (!currentUser.isLoggedin) {
        return next(
            new AppError('Session expired or user logged out. Please log in again.', 401)
        );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});
