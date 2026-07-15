const express = require('express');
const { findOrCreateMovie } = require('../controllers/movieController');
const { authMiddleware } = require('../middleware/authMiddleware');

const _ = express.Router();



_.post('/', authMiddleware, findOrCreateMovie);

module.exports = _;