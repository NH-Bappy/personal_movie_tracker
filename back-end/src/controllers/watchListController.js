const { prisma } = require("../config/db");



const addToWatchList = async (req , res) => {
    const { movieId , status , rating , notes} = req.body;

    //verify movie exists
    const movie = await prisma.movie.findUnique({
        where: {id : movieId},
    });
    
    if (!movie) {
    return res.status(404).json({ error: "movie not found" });
    }

    // check if already exists
    const alreadyExists = await prisma.watchListItem.findUnique({
        where: {userId_movieId: {
            userId: req.user.id,
            movieId: movieId,
        }},
    });

    if (alreadyExists) {
    return res.status(400).json({ message: "movie already in watch list" });
    }

//create watch list item
    const addMovie = await prisma.watchListItem.create({
        data: {
            userId: req.user.id,
            movieId,
            status: status || "PLANNED",
            rating: rating ?? null,
            notes: notes ?? null,
        },
    });

    res.status(201).json({
        status: "success",
        data: {
            addMovie,
        },
    });

};


const removeMovie = async (req , res) => {
// Find watchList item and verify ownership
  const watchList = await prisma.watchListItem.findUnique({
    where: { id: req.params.id },
  });

   if (!watchList) {
    return res.status(404).json({ error: "item not found" });
  }

    if (watchList.userId !== req.user.id) {
    return res
      .status(403)
      .json({ error: "Not allowed to update this watchList item" });
  }

    await prisma.watchListItem.delete({
    where: { id: req.params.id },
  });


  res.status(200).json({
    status: "success",
    message: "Movie removed from watchList",
    data: { watchList }
  });

};

const getWatchList = async (req, res) => {
  try {
    const watchList = await prisma.watchListItem.findMany({
      where: { userId: req.user.id },
      include: {
        movie: true
      }
    });

    res.status(200).json({
      status: "success",
      data: { watchList }
    });
  } catch (error) {
    console.error("Error in getWatchList:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateWatchListItem = async (req, res) => {
  try {
    const { status, rating, notes } = req.body;

    // Find watchlist item
    const watchList = await prisma.watchListItem.findUnique({
      where: { id: req.params.id },
    });

    if (!watchList) {
      return res.status(404).json({ error: "Watchlist item not found" });
    }

    // Verify ownership
    if (watchList.userId !== req.user.id) {
      return res.status(403).json({ error: "Not allowed to update this watchlist item" });
    }

    // Update watchlist item
    const updatedItem = await prisma.watchListItem.update({
      where: { id: req.params.id },
      data: {
        status: status !== undefined ? status : watchList.status,
        rating: rating !== undefined ? rating : watchList.rating,
        notes: notes !== undefined ? notes : watchList.notes,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        watchList: updatedItem,
      },
    });
  } catch (error) {
    console.error("Error in updateWatchListItem:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {addToWatchList ,removeMovie, getWatchList, updateWatchListItem};