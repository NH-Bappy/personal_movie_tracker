const { prisma } = require("../config/db");

const findOrCreateMovie = async (req, res) => {
    try {
        const { id, title, overview, releaseYear, genres, runtime, posterUrl } = req.body;

        if (!title || !releaseYear) {
            return res.status(400).json({ error: "Title and releaseYear are required" });
        }

        const parsedYear = parseInt(releaseYear, 10);
        if (isNaN(parsedYear)) {
            return res.status(400).json({ error: "releaseYear must be a valid number" });
        }

        // Check if the movie already exists by ID
        let movie = null;
        if (id) {
            movie = await prisma.movie.findUnique({
                where: { id: String(id) }
            });
        }

        // Check if the movie already exists by title & year as a fallback
        if (!movie) {
            movie = await prisma.movie.findFirst({
                where: {
                    title: {
                        equals: title,
                        mode: "insensitive"
                    },
                    releaseYear: parsedYear
                }
            });
        }

        // If it doesn't exist, create it
        if (!movie) {
            movie = await prisma.movie.create({
                data: {
                    id: id ? String(id) : undefined,
                    title,
                    overview: overview || null,
                    releaseYear: parsedYear,
                    genres: genres || [],
                    runtime: runtime ? parseInt(runtime, 10) : null,
                    posterUrl: posterUrl || null,
                    createdBy: req.user.id
                }
            });
        }

        res.status(200).json({
            status: "success",
            data: { movie }
        });
    } catch (error) {
        console.error("Error in findOrCreateMovie:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { findOrCreateMovie };
