import React from 'react'
import icon from "../images/header-icon.png"
import "./style.css"
function Header() {
  return (
    <header className='header'>
        <img src={icon} alt='header icon'/>
        <h2>Meme Generator</h2> 
    </header>
  )
}

export default Header