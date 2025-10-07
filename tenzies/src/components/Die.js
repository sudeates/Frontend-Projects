import React,{useState} from 'react'
import "./style.css"

function Die(props) {
  const styles={
    backgroundColor: props.isHeld ? "#59E391" : "white"
  }
  return (
    <button 
    style={styles}
    onClick={props.hold}
    >{props.value}</button>
  )
}

export default Die