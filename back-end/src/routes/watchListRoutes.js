const express = require('express');
const { addToWatchList, removeMovie, getWatchList, updateWatchListItem } = require('../controllers/watchListController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { addToWatchListSchema, updateWatchListSchema } = require('../validators/watchListValidators');
const _ = express.Router()


_.use(authMiddleware)
_.get("/" , getWatchList)
_.post("/add" ,validateRequest(addToWatchListSchema), addToWatchList)
_.put("/update/:id" ,validateRequest(updateWatchListSchema), updateWatchListItem)
_.delete("/delete/:id" ,removeMovie)

module.exports =_;