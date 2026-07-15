import React from 'react';
import { Link } from 'react-router-dom';
import { useMovieContext } from '../contexts/MovieContext';
import { useAuth } from '../contexts/AuthContext';
import { FaTrash, FaPlay, FaCheck, FaBookOpen, FaTimes } from 'react-icons/fa';
import '../css/Watchlist.css';

const Watchlist = () => {
    const { favorites, removeFromFavorites } = useMovieContext();
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="watchlist-page">
                <div className="not-logged-in-alert">
                    <h3>Your Watchlist</h3>
                    <p>Log in to access your personal watchlist, save your watching progress, and organize movies into custom sections!</p>
                    <Link to="/login" className="watchlist-login-btn">Sign In Now</Link>
                </div>
            </div>
        );
    }

    // Filter favorites by status
    const plannedList = favorites.filter(movie => !movie.status || movie.status === 'PLANNED');
    const watchingList = favorites.filter(movie => movie.status === 'WATCHING');
    const completedList = favorites.filter(movie => movie.status === 'COMPLETE');
    const droppedList = favorites.filter(movie => movie.status === 'DROPPED');

    const columns = [
        {
            title: 'Plan to Watch',
            status: 'PLANNED',
            movies: plannedList,
            icon: <FaBookOpen className="status-planned" />,
            titleClass: 'status-planned'
        },
        {
            title: 'Watching',
            status: 'WATCHING',
            movies: watchingList,
            icon: <FaPlay className="status-watching" />,
            titleClass: 'status-watching'
        },
        {
            title: 'Completed',
            status: 'COMPLETE',
            movies: completedList,
            icon: <FaCheck className="status-completed" />,
            titleClass: 'status-completed'
        },
        {
            title: 'Dropped',
            status: 'DROPPED',
            movies: droppedList,
            icon: <FaTimes className="status-dropped" />,
            titleClass: 'status-dropped'
        }
    ];

    const handleDelete = async (e, movie) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to remove "${movie.title}" from your watchlist?`)) {
            await removeFromFavorites(movie);
        }
    };

    return (
        <div className="watchlist-page">
            <div className="watchlist-header">
                <h2>Your Cinema Workspace</h2>
                <p>Track your cinematic progress, manage watching states, and log completed titles.</p>
            </div>

            <div className="watchlist-grid">
                {columns.map((col) => (
                    <div className="watchlist-column" key={col.status}>
                        <div className="column-header">
                            <span className={`column-title ${col.titleClass}`}>
                                {col.icon}
                                {col.title}
                            </span>
                            <span className="movie-count-badge">{col.movies.length}</span>
                        </div>

                        <div className="column-movie-list">
                            {col.movies.length > 0 ? (
                                col.movies.map((movie) => {
                                    const posterUrl = movie.poster_path
                                        ? (movie.poster_path.startsWith('http') 
                                            ? movie.poster_path 
                                            : `https://image.tmdb.org/t/p/w200${movie.poster_path}`)
                                        : 'https://via.placeholder.com/200x300?text=No+Image';

                                    const releaseYear = movie.release_date 
                                        ? movie.release_date.split('-')[0] 
                                        : 'N/A';

                                    return (
                                        <Link 
                                            to={`/movie/${movie.id}`} 
                                            className="watchlist-card" 
                                            key={movie.dbWatchListId || movie.id}
                                        >
                                            <div className="watchlist-card-thumb">
                                                <img src={posterUrl} alt={movie.title} />
                                            </div>
                                            <div className="watchlist-card-info">
                                                <div>
                                                    <h4 className="watchlist-card-title">{movie.title}</h4>
                                                    <span className="watchlist-card-meta">{releaseYear}</span>
                                                </div>
                                                <div className="watchlist-card-actions">
                                                    <button 
                                                        onClick={(e) => handleDelete(e, movie)}
                                                        className="quick-delete-btn"
                                                        title="Remove from watchlist"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="empty-column-message">No movies here</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Watchlist;
