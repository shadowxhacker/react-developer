import React from 'react'
import Card from './components/Card'
import { useNavigate } from 'react-router-dom'

function CardsData() {
    const navigate = useNavigate();
    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 auto-rows-auto'>
            <Card title="Website HTML, CSS, JS" param="We offer a HTML, CSS, JS Website with 2/3 pages using Some Scrolling Animations Also this support TailwindCss Backend Ecommerce Websites customizations!" button="Hire Now" price='Basic $12.53' image="https://i.pinimg.com/564x/19/d0/ec/19d0ecc9130f7dec29cb854856fcfaf9.jpg" />
            <Card title="Website HTML, CSS, JS+" param="We offer a react web application full customizable multiple pages with Professional JS Animations also support TailwindCSS cursor Customization ThirdParty Backed" button="Hire Now" price='Professional $40.92' image="https://i.pinimg.com/564x/7c/59/9b/7c599bb2cafe1ea708e53652f58e6b37.jpg" />
            <Card title="Web Application React Js" param="We offer a react web application full customizable multiple pages and also scrolling animations supported CSS and also support TailwindCSS and Backend ThirdParty!" button="Hire Now" price='Enterprice $50.99' image="https://i.pinimg.com/564x/38/a4/e2/38a4e2129b638942d05f8519290a2954.jpg" />
        </div>
    )
}

export default CardsData
