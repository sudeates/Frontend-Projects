import './App.css';
import Die from './components/Die';
import React,{useEffect, useState,useRef} from 'react';
import { useWindowSize } from 'react-use'
import { nanoid } from "nanoid"
import Confetti from 'react-confetti'

function App() {
  const [dice,setDice]=useState(()=>generateAllNewDice())
  const { width, height } = useWindowSize()
  const gameWon= dice.every(die=>die.isHeld) &&
      dice.every(die=> die.value===dice[0].value)
  const buttonRef=useRef(null)
  const [time,setTime]= useState(0);
  const [isRunning,setIsRunning]=useState(false);

  useEffect(()=>{
    let id;
    if(isRunning){
      id=setInterval(()=>setTime(t=>t+1),1000)
    }
    return ()=>clearInterval(id)
  },[isRunning])

  useEffect(()=>{
    if(gameWon){
      buttonRef.current.focus()
    }
  },[gameWon])

  useEffect(()=>{
    if(gameWon){
      setIsRunning(false)
    }
  },[gameWon])

  console.log(buttonRef)
  function generateAllNewDice() {
        return new Array(10)
            .fill(0)
            .map(() => ({
                value: Math.ceil(Math.random() * 6), 
                isHeld: false,
                id:nanoid()
            }))
    }
  function rollDice(){
    if(gameWon)
    { setDice(generateAllNewDice())
      setIsRunning(false)
      setTime(0)
    }
    else { 
      if(!isRunning)setIsRunning(true)
      setDice(oldDice=>oldDice.map(
      die=>die.isHeld?
        die:{...die,value:Math.ceil(Math.random()*6)}
    ))}
  }

  function hold(id){
    setDice(oldDice=>{
      return oldDice.map(die=>{
        return die.id=== id?
              {...die,isHeld:!die.isHeld}:
              die 
      })
    })
  }
  function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
  }
  const diceElements=dice.map(dieObj=><Die 
    key={dieObj.id} 
    value={dieObj.value} 
    isHeld={dieObj.isHeld}
    id={dieObj.id}
    hold={()=>hold(dieObj.id)}
    />)

  return (
    <main>
      {gameWon &&<Confetti
      width={width}
      height={height}
      />}
      <h1 className="title">Tenzies</h1>
      <p className="time">{formatTime(time)}</p>
      <p className="instructions">Roll until all dice are the same. Click each die to freeze it at its current value between rolls.</p>
      <div className='dice-container'>
        {diceElements}
      </div>
      <button ref={buttonRef} className='roll-button' onClick={rollDice}>
        {gameWon?"New Game":"Roll"}
      </button>
    </main>
  );
}

export default App;
