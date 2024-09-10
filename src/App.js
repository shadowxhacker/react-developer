import React from 'react'
import Header from './components/Header'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import CardData from './CardsData'
import ReactGA from 'react-ga'
import { Routes, Route } from 'react-router-dom'

const TRACKING_ID = "GTM-WM2KX36C";
ReactGA.initialize(TRACKING_ID);


function App() {
  return (
    <div>
      <Header />
      <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/orders' element={<CardData />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
        </Routes>
    </div>
  )
}

export default App
