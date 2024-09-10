import React from 'react'
import Header from './components/Header'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import CardData from './CardsData'
import Blog from './pages/Blog'
import { Routes, Route } from 'react-router-dom'



function App() {
  return (
    <div>
      <Header />
      <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/orders' element={<CardData />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/blog' element={<Blog />} />
        </Routes>
    </div>
  )
}

export default App
