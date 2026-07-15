import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import "./css/Navbar.css"


const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className='navbar'>
        <div className="navbar-brand">
            <Link to={"/"} className="brand-link">
                <img src="/logo.jpg" alt="Allmovies Logo" className="navbar-logo" />
                <span>Allmovies</span>
            </Link>
        </div>
        <div className="navbar-links">
            <Link to={"/"} className="nav-link">Home</Link>
            <Link to={"/watchlist"} className="nav-link">Watchlist</Link>
            <Link to={"/Favorites"} className="nav-link">Favorites</Link>
            {user ? (
                <>
                    <span className="user-greet">Hello, {user.name || user.email.split('@')[0]}</span>
                    <button onClick={logout} className="logout-btn">Logout</button>
                </>
            ) : (
                <>
                    <Link to={"/login"} className="nav-link">Login</Link>
                    <Link to={"/register"} className="nav-link">Register</Link>
                </>
            )}
        </div>
    </nav>
  )
}

export default Navbar