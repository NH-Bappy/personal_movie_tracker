import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails } from '../services/Api';
import { useMovieContext } from '../contexts/MovieContext';
import { FaStar, FaClock, FaCalendarAlt } from 'react-icons/fa';
import '../css/MovieDetails.css';

const MovieDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { updateWatchListStatus, getMovieStatus } = useMovieContext();
    
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadMovieData = async () => {
            try {
                setLoading(true);
                const data = await getMovieDetails(id);
                if (data.success === false) {
                    throw new Error(data.status_message || "Movie not found");
                }
                setMovie(data);
                setError(null);
            } catch (err) {
                console.error("Error loading movie details:", err);
                setError(err.message || "Failed to load movie details");
            } finally {
                setLoading(false);
            }
        };

        loadMovieData();
    }, [id]);

    if (loading) {
        return <div className="details-loading">Loading movie details...</div>;
    }

    if (error) {
        return (
            <div className="details-error">
                <div className="details-error-msg">Error: {error}</div>
                <button className="back-home-btn" onClick={() => navigate('/')}>Back to Home</button>
            </div>
        );
    }

    if (!movie) return null;

    const currentStatus = getMovieStatus(movie) || 'REMOVE';

    const handleStatusChange = async (newStatus) => {
        // TMDB movie object needs standard field mappings for the database representation
        const moviePayload = {
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            release_date: movie.release_date,
            poster_path: movie.poster_path,
            genres: movie.genres ? movie.genres.map(g => g.name) : [],
            runtime: movie.runtime,
        };
        await updateWatchListStatus(moviePayload, newStatus);
    };

    const releaseYear = movie.release_date ? movie.release_date.split("-")[0] : "N/A";
    const backdropUrl = movie.backdrop_path 
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` 
        : "";
    const posterUrl = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
        : "https://via.placeholder.com/500x750?text=No+Image";

    // Helper for formatting status display
    const formatStatusName = (status) => {
        if (status === 'COMPLETE') return 'Completed';
        return status.charAt(0) + status.slice(1).toLowerCase();
    };

    return (
        <div className="movie-details-page">
            {backdropUrl && (
                <div 
                    className="movie-backdrop" 
                    style={{ backgroundImage: `url(${backdropUrl})` }}
                />
            )}
            
            <div className="movie-details-container">
                <div className="movie-details-poster">
                    <img src={posterUrl} alt={movie.title} />
                </div>
                
                <div className="movie-details-info">
                    <div className="movie-title-section">
                        <h1>{movie.title}</h1>
                        {movie.tagline && <p className="movie-tagline">"{movie.tagline}"</p>}
                    </div>

                    <div className="movie-meta-row">
                        <div className="meta-item">
                            <FaCalendarAlt color="#ff3366" />
                            <span>{releaseYear}</span>
                        </div>
                        <span className="meta-divider">|</span>
                        <div className="meta-item">
                            <FaClock color="#ff3366" />
                            <span>{movie.runtime ? `${movie.runtime} min` : "N/A"}</span>
                        </div>
                        <span className="meta-divider">|</span>
                        <div className="meta-item rating-badge">
                            <FaStar />
                            <span>{movie.vote_average ? movie.vote_average.toFixed(1) : "0.0"} / 10</span>
                        </div>
                        {currentStatus !== 'REMOVE' && (
                            <>
                                <span className="meta-divider">|</span>
                                <div className={`status-badge-meta status-badge-${currentStatus.toLowerCase() === 'complete' ? 'completed' : currentStatus.toLowerCase()}`}>
                                    <span>Status: {formatStatusName(currentStatus)}</span>
                                </div>
                            </>
                        )}
                    </div>

                    {movie.genres && movie.genres.length > 0 && (
                        <div className="genre-container">
                            {movie.genres.map((genre) => (
                                <span key={genre.id} className="genre-badge">{genre.name}</span>
                            ))}
                        </div>
                    )}

                    <div className="movie-overview-section">
                        <h2>Overview</h2>
                        <p>{movie.overview || "No overview available for this movie."}</p>
                    </div>

                    <div className="details-action-bar">
                        <div className="status-select-container">
                            <label className="status-select-label" htmlFor="status-select">Set Watchlist Status</label>
                            <select 
                                id="status-select" 
                                className="status-select-dropdown"
                                value={currentStatus}
                                onChange={(e) => handleStatusChange(e.target.value)}
                            >
                                <option value="REMOVE">Not in Watchlist (Remove)</option>
                                <option value="PLANNED">Plan to Watch</option>
                                <option value="WATCHING">Watching</option>
                                <option value="COMPLETE">Completed</option>
                                <option value="DROPPED">Dropped</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;
