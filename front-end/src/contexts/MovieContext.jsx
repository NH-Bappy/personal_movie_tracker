import { useState, useEffect, useContext, createContext } from 'react'
import { useAuth } from './AuthContext'

const MovieContext = createContext()

export const useMovieContext = () => useContext(MovieContext)

export const MovieProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([])
    const { user, token, API_URL } = useAuth()

    // 1. Load initial favorites: from backend (if logged in) or localstorage (if logged out)
    useEffect(() => {
        const fetchWatchlist = async () => {
            if (user && token) {
                try {
                    const response = await fetch(`${API_URL}/watchList`, {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    const result = await response.json();
                    if (response.ok && result.status === "success") {
                        // Transform backend database structure to fit frontend movie shape
                        const syncedFavs = result.data.watchList.map(item => {
                            // Check if it's a numeric TMDB ID stored as string, and convert it back
                            const parsedId = /^\d+$/.test(item.movie.id) ? Number(item.movie.id) : item.movie.id;
                            return {
                                id: parsedId,
                                dbMovieId: item.movie.id,
                                dbWatchListId: item.id,
                                title: item.movie.title,
                                overview: item.movie.overview,
                                poster_path: item.movie.posterUrl,
                                release_date: `${item.movie.releaseYear}-01-01`, // Format back to standard date
                                status: item.status, // Planned, Watching, Complete, Dropped
                            };
                        });
                        setFavorites(syncedFavs);
                    }
                } catch (error) {
                    console.error("Error fetching watchlist from backend:", error);
                }
            } else {
                // If logged out, load from local storage
                const storedFavs = localStorage.getItem("favorites")
                if (storedFavs) {
                    setFavorites(JSON.parse(storedFavs));
                } else {
                    setFavorites([]);
                }
            }
        };

        fetchWatchlist();
    }, [user, token, API_URL]);

    // 2. Persist local favorites to localstorage only when logged out
    useEffect(() => {
        if (!user) {
            localStorage.setItem('favorites', JSON.stringify(favorites))
        }
    }, [favorites, user])

    const addToFavorites = async (movie, status = "PLANNED") => {
        if (user && token) {
            const tempId = `temp-${Date.now()}`;
            const newMovieItem = {
                id: movie.id, // Keep TMDB ID for toggle UI match
                dbMovieId: movie.dbMovieId || String(movie.id),
                dbWatchListId: tempId,
                title: movie.title,
                overview: movie.overview,
                poster_path: movie.poster_path,
                release_date: movie.release_date,
                status: status,
            };

            // Update UI immediately (optimistic update)
            setFavorites(prev => [...prev, newMovieItem]);

            try {
                // Step A: Ensure movie exists in local database
                const releaseYear = movie.release_date 
                    ? parseInt(movie.release_date.split("-")[0]) 
                    : (movie.releaseYear || 2000);

                const cinemaResponse = await fetch(`${API_URL}/cinema`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        id: String(movie.id), // Pass TMDB ID as string
                        title: movie.title,
                        overview: movie.overview,
                        releaseYear: releaseYear,
                        genres: movie.genres || [],
                        runtime: movie.runtime || null,
                        posterUrl: movie.poster_path
                    })
                });

                const cinemaResult = await cinemaResponse.json();
                if (!cinemaResponse.ok) {
                    throw new Error(cinemaResult.error || "Failed to resolve movie in DB");
                }

                const dbMovie = cinemaResult.data.movie;

                // Step B: Add movie to watchlist in database
                const watchlistResponse = await fetch(`${API_URL}/watchList/add`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        movieId: dbMovie.id,
                        status: status
                    })
                });

                const watchlistResult = await watchlistResponse.json();
                if (!watchlistResponse.ok) {
                    throw new Error(watchlistResult.message || "Failed to add to watchlist");
                }

                const watchListItem = watchlistResult.data.addMovie;

                // Update local React state with actual IDs from the database
                setFavorites(prev => prev.map(item => 
                    item.dbWatchListId === tempId
                        ? { ...item, dbMovieId: dbMovie.id, dbWatchListId: watchListItem.id }
                        : item
                ));

            } catch (error) {
                console.error("Error adding to database watchlist:", error);
                // Revert optimistic update
                setFavorites(prev => prev.filter(item => item.dbWatchListId !== tempId));
                alert(`Error adding to favorites: ${error.message}`);
            }
        } else {
            // Local favorites flow
            setFavorites(prev => [...prev, { ...movie, status }]);
        }
    }

    const removeFromFavorites = async (movieOrId) => {
        const isObject = typeof movieOrId === 'object' && movieOrId !== null;
        const targetId = isObject ? movieOrId.id : movieOrId;

        if (user && token) {
            // Find matching item in local state
            const targetFav = favorites.find(fav => {
                if (isObject) {
                    const favYear = fav.release_date ? parseInt(fav.release_date.split("-")[0]) : null;
                    const movieYear = movieOrId.release_date ? parseInt(movieOrId.release_date.split("-")[0]) : null;
                    return fav.id === movieOrId.id || 
                           (fav.title?.toLowerCase() === movieOrId.title?.toLowerCase() && favYear === movieYear);
                }
                return fav.id === targetId || fav.dbMovieId === targetId;
            });

            if (!targetFav) {
                console.warn("Could not find matching item to remove:", movieOrId);
                return;
            }

            // Update UI immediately (optimistic update)
            setFavorites(prev => prev.filter(item => {
                if (targetFav.dbWatchListId) {
                    return item.dbWatchListId !== targetFav.dbWatchListId;
                }
                return item.id !== targetId && item.dbMovieId !== targetId;
            }));

            // If it has a real DB ID and is not temporary, call the API in the background
            if (targetFav.dbWatchListId && !targetFav.dbWatchListId.startsWith('temp-')) {
                try {
                    const response = await fetch(`${API_URL}/watchList/delete/${targetFav.dbWatchListId}`, {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });

                    const result = await response.json();
                    if (!response.ok) {
                        throw new Error(result.error || "Failed to remove from watchlist");
                    }
                } catch (error) {
                    console.error("Error removing from database watchlist:", error);
                    // Revert optimistic update by adding the item back
                    setFavorites(prev => [...prev, targetFav]);
                    alert(`Error removing from favorites: ${error.message}`);
                }
            }
        } else {
            // Local favorites flow
            setFavorites(prev => prev.filter(movie => movie.id !== targetId))
        }
    }

    const updateWatchListStatus = async (movie, newStatus) => {
        const isObject = typeof movie === 'object' && movie !== null;
        const targetId = isObject ? movie.id : movie;

        if (newStatus === "REMOVE") {
            await removeFromFavorites(movie);
            return;
        }

        if (user && token) {
            // Find existing
            const targetFav = favorites.find(fav => {
                if (isObject) {
                    const favYear = fav.release_date ? parseInt(fav.release_date.split("-")[0]) : null;
                    const movieYear = movie.release_date ? parseInt(movie.release_date.split("-")[0]) : null;
                    return fav.id === movie.id || 
                           fav.dbMovieId === movie.id ||
                           (fav.title?.toLowerCase() === movie.title?.toLowerCase() && favYear === movieYear);
                }
                return fav.id === targetId || fav.dbMovieId === targetId;
            });

            if (targetFav) {
                const oldStatus = targetFav.status;

                // Update UI immediately (optimistic update)
                setFavorites(prev => prev.map(item => 
                    item.dbWatchListId === targetFav.dbWatchListId 
                        ? { ...item, status: newStatus }
                        : item
                ));

                // If it is a real DB ID and not temporary, call the API in the background
                if (targetFav.dbWatchListId && !targetFav.dbWatchListId.startsWith('temp-')) {
                    try {
                        const response = await fetch(`${API_URL}/watchList/update/${targetFav.dbWatchListId}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            },
                            body: JSON.stringify({ status: newStatus })
                        });
                        const result = await response.json();
                        if (!response.ok) {
                            throw new Error(result.error || "Failed to update status");
                        }
                    } catch (error) {
                        console.error("Error updating watchlist status:", error);
                        // Revert optimistic update
                        setFavorites(prev => prev.map(item => 
                            item.dbWatchListId === targetFav.dbWatchListId 
                                ? { ...item, status: oldStatus }
                                : item
                        ));
                        alert(`Error: ${error.message}`);
                    }
                }
            } else {
                // First add to watchlist with this status
                await addToFavorites(movie, newStatus);
            }
        } else {
            // Local fallback
            const exists = favorites.some(fav => fav.id === targetId);
            if (exists) {
                setFavorites(prev => prev.map(item => 
                    item.id === targetId ? { ...item, status: newStatus } : item
                ));
            } else {
                setFavorites(prev => [...prev, { ...movie, status: newStatus }]);
            }
        }
    }

    const isFavorites = (movieOrId) => {
        if (!movieOrId) return false;
        
        const isObject = typeof movieOrId === 'object' && movieOrId !== null;
        const targetId = isObject ? movieOrId.id : movieOrId;

        if (user) {
            return favorites.some(fav => {
                if (isObject) {
                    const favYear = fav.release_date ? parseInt(fav.release_date.split("-")[0]) : null;
                    const movieYear = movieOrId.release_date ? parseInt(movieOrId.release_date.split("-")[0]) : null;
                    return fav.id === movieOrId.id || 
                           fav.dbMovieId === movieOrId.id ||
                           (fav.title?.toLowerCase() === movieOrId.title?.toLowerCase() && favYear === movieYear);
                }
                return fav.id === targetId || fav.dbMovieId === targetId;
            });
        }

        return favorites.some(movie => movie.id === targetId)
    }

    const getMovieStatus = (movieOrId) => {
        if (!movieOrId) return null;
        const isObject = typeof movieOrId === 'object' && movieOrId !== null;
        const targetId = isObject ? movieOrId.id : movieOrId;

        const found = favorites.find(fav => {
            if (isObject) {
                const favYear = fav.release_date ? parseInt(fav.release_date.split("-")[0]) : null;
                const movieYear = movieOrId.release_date ? parseInt(movieOrId.release_date.split("-")[0]) : null;
                return fav.id === movieOrId.id || 
                       fav.dbMovieId === movieOrId.id ||
                       (fav.title?.toLowerCase() === movieOrId.title?.toLowerCase() && favYear === movieYear);
            }
            return fav.id === targetId || fav.dbMovieId === targetId;
        });

        return found ? found.status : null;
    }

    const value = {
        favorites,
        addToFavorites,
        removeFromFavorites,
        updateWatchListStatus,
        isFavorites,
        getMovieStatus
    }

    return (
        <MovieContext.Provider value={value}>
            {children}
        </MovieContext.Provider>
    )
}