import React from 'react'
import { Input, Submit } from './Input'

import s from '../styles/Card.module.css'

function randomize(g) {
  g(new Array(4).fill(0)
  .map(e => ((Math.random()*20)-10).toFixed(5)));
}

export default function CardLeft({ setVars, vars, setActive, sketch }) {
  return (
    <>
      <img draggable={false} className={ s.logo } src="/logo.svg" alt="LOGO" />
      <h1 className={ s.title }>Find roots of any function</h1>
      <Input
        label="Type in a function "
        secondary="(using Symbolic Computation syntax)"
        id="function"
        def={vars.func}
        special="function"
        onChange={(v) => setVars({ func: v })}
        randomize={undefined}      />
      <Input
        label="Enter initial guesses "
        secondary="(separated by spaces using . as comma)"
        id="guesses"
        def={ vars.guesses.join(' ') }
        special="random"
        randomize={randomize}
        onChange={ (g) => { 
          let val = typeof g==='string' ? g.split(' ').map(e => parseFloat(e)||0) : g.map(e => parseFloat(e)||0);
          setVars({ guesses: val });
        }}
      />
      <Input
        label="Set the accuracy "
        secondary="(10 thousand by default; up to infinity)"
        def={vars.acc}
        id="accuracy"
        onChange={(a) => setVars({ acc: parseInt(a)||vars.acc })} randomize={undefined} special={undefined}      />
      <Submit action={() => {
        window.setTimeout(() => {
          setActive('right');

          if (vars.guesses.length === 0) {
            randomize(g => {
              setVars({ guesses: g});
              sketch.sketch(g);
            });
          } else {
            sketch.sketch();
          }

        }, 100);
      }} value="Calculate!"/>
    </>
  )
}
