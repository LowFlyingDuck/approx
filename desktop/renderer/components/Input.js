import React from 'react'
import { useState,useRef } from 'react'

import s from '../styles/Input.module.css'

function Input({ randomize, label, secondary, id, special, def, onChange }) {
  const input = useRef(null);

  return (
    <div className={ s.input }>
      <label className={s.label} htmlFor={id}><b>{label}</b>{secondary}</label>
      <div className={ s.inputRow }>
        {special==='function' && <p className='flexCentred'>f(x) = </p>}
        
        <input
        className={ s.inputEl }
        id={id} type="text"
        defaultValue={def}
        ref={input}
        onChange={v => onChange(v.target.value)}
        />


        {special==='random' && typeof randomize === 'function' &&
        <Submit value={ <img src='/assets/shuffle.svg' /> } action={ () => randomize(g => {
          onChange(g);
          input.current.value = g.join(' ');
          })
          }
        />}
      </div>
    </div>
  )
}

function Submit({ action, value }) {
  return (
    <div
    onClick={typeof action==='function' ? action : ()=>{}}
    className={ s.submit + ' flexCentred' }
    >
      <p className='flexCentred'>{ value }</p>
    </div>
  )
}

export { Input, Submit }