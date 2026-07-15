import React from 'react'
import { Link } from 'react-router-dom';
import { FaHeart } from "react-icons/fa";
import "../css/MovieCard.css"
import { useMovieContext } from '../contexts/MovieContext';


const MoviesCard = ({movie}) => {

  const {addToFavorites , removeFromFavorites , isFavorites} = useMovieContext()

  const favorite = isFavorites(movie)

    function onFavoriteClick(e) {
      e.preventDefault()
      e.stopPropagation() // Prevent navigation when clicking the favorite button
      if(favorite) removeFromFavorites(movie)
        else addToFavorites(movie)
    }

  const getPosterUrl = () => {
    if (!movie.poster_path) return 'https://via.placeholder.com/500x750?text=No+Image';
    if (movie.poster_path.startsWith('http://') || movie.poster_path.startsWith('https://')) {
      return movie.poster_path;
    }
    return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  };

  return (
    <Link to={`/movie/${movie.id}`} className="movie-card-link">
      <div className="movie-card">
          <div className="movie-poster">
              <img src={getPosterUrl()} alt={movie.title} />
              <div className="movie-overlay">
                  <button className={`favorite-btn ${favorite ? "active" : ""}`} onClick={onFavoriteClick}>
                  <FaHeart />
                  </button>
              </div>
          </div>

          <div className="movie-info">
          <h3>{movie.title}</h3>
          <p>{movie.release_date?.split("-")[0] || movie.releaseYear}</p>
          </div>
      </div>
    </Link>
  )
}

export default MoviesCard