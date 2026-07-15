import "./css/App.css";
import Home from './pages/Home'
import {Routes, Route } from 'react-router-dom'
import Favorites from './pages/Favorites'
import Login from './pages/Login'
import Register from './pages/Register'
import MovieDetails from './pages/MovieDetails'
import Watchlist from './pages/Watchlist'
import { AuthProvider } from "./contexts/AuthContext";
import { MovieProvider } from "./contexts/MovieContext";
import Navbar from './Navbar'



function App() {



  return (
    <AuthProvider>
      <MovieProvider>
        <Navbar/>
      <main className="main-content">
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/Favorites' element={<Favorites/>}/>
          <Route path='/watchlist' element={<Watchlist/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/movie/:id' element={<MovieDetails/>}/>
        </Routes>
      </main>
      </MovieProvider>
    </AuthProvider>
  )
}

export default App
