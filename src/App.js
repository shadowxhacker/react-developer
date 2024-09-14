import React from 'react'
import Header from './components/Header'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import CardData from './CardsData'
import Blog from './pages/Blog'
import Signup from './components/Singup'
import { Routes, Route } from 'react-router-dom'



function App() {
  return (
    <div>
      <Header />
      <Routes>
            <Route path='/' element={<Blog />} />
            <Route path='/home' element={<Home />} />
            <Route path='/orders' element={<CardData />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/singup' element={<Signup />} />
        </Routes>
    </div>
  )
}

export default App
