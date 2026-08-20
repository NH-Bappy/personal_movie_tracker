import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { FaBars, FaTimes } from 'react-icons/fa'
import "./css/Navbar.css"

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className='navbar'>
      <div className="navbar-brand">
        <Link to={"/"} className="brand-link" onClick={() => setIsMenuOpen(false)}>
          <img src="/logo.jpg" alt="Allmovies Logo" className="navbar-logo" />
          <span>Allmovies</span>
        </Link>
      </div>

      <button 
        className="menu-toggle-btn" 
        onClick={toggleMenu} 
        aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
      >
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`navbar-links ${isMenuOpen ? 'mobile-open' : ''}`}>
        <Link to={"/"} className="nav-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
        <Link to={"/watchlist"} className="nav-link" onClick={() => setIsMenuOpen(false)}>Watchlist</Link>
        <Link to={"/Favorites"} className="nav-link" onClick={() => setIsMenuOpen(false)}>Favorites</Link>
        {user ? (
          <div className="user-nav-group">
            <span className="user-greet">Hello, {user.name || user.email.split('@')[0]}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        ) : (
          <div className="auth-nav-group">
            <Link to={"/login"} className="nav-link" onClick={() => setIsMenuOpen(false)}>Login</Link>
            <Link to={"/register"} className="nav-link nav-link-register" onClick={() => setIsMenuOpen(false)}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar