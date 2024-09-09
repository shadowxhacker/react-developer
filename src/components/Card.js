import React from 'react'
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Card(props) {
    const navigate = useNavigate();
    const image = props.image;
    const price = props.price;
    const title = props.title;
    const param = props.param;
    const button = props.button;

    function handleClick(){
      navigate('/contact');
    }
  return (
    <>
    <div className='w-full h-full flex flex-wrap mt-6 p-7'>
        <div className='flex flex-col items-center w-[300px] h-auto bg-slate-300/55 rounded-xl border-2 border-violet-300 p-2 relative'>
        <Link to='/about'><img src={image} alt={title} className='object-cover h-[190px] w-[300px] rounded-xl hover:scale-[1.2] duration-75 transition-all cursor-pointer' /></Link>
        <p className='font-bold text-purple-900 text-[20px] mt-2 p-1 bg-slate-50 w-auto rounded-xl'>{price}</p>
        <h1 className='font-bold text-[1.1rem] pl-2 pt-3 pr-1'>{title}</h1>
        <p className='pt-1 pl-2 text-[16px]'>{param}</p>
        <button className='relative bottom-[-1rem] bg-sky-500 ease-in duration-75 w-[100px] h-[40px] rounded-xl hover:bg-sky-400 font-bold text-stone-100' onClick={handleClick}>{button}</button>
        </div>
    </div>
    </>
  )
}

export default Card
