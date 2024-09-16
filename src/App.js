import React from 'react'
import Header from './components/Header'
import About from './pages/About'
import Contact from './pages/Contact'
import CardData from './CardsData'
import Blog from './pages/Blog'
import Singup from './components/Singup'
import Profile from './components/Profile'
import { Routes, Route } from 'react-router-dom'



function App() {
  return (
    <div>
      <Header />
      <Routes>
            <Route path='/' element={<Blog />} />
            <Route path='/orders' element={<CardData />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/singup' element={<Singup />} />
        </Routes>
    </div>
  )
}

export default App
