const express = require('express');
const _ = express.Router();
const { registration ,login, logout } = require('../controllers/authController');
// const { authMiddleware } = require('../middleware/authMiddleware');


    

_.post("/register" , registration);
_.post("/login" , login);
_.post("/logout" ,logout);

module.exports = _;