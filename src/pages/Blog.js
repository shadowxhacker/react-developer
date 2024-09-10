import React from 'react'
import Post from '../components/Post'

function Blog() {
    return (
    <div>
    <Post
    heading='Web Developer'
    param='Web developers create functional, user-friendly websites and web applications. They may write code, develop and test new applications, or monitor site performance and traffic.'
    button='Read More....'
    />
    <Post
    heading='What are web developer skills?'
    param='Web Developers are required to be proficient at coding with languages like HTML, CSS, JavaScript for front-end development, and Python, Java, Ruby, and PHP for back-end programming. Knowledge of back-end languages is particularly useful for Full Stack Web Developers.'
    button='Read More....'
    />
    </div>
  )
}

export default Blog
