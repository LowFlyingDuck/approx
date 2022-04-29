import React from 'react'
import { useState, useReducer } from 'react'

import Head from 'next/head'
import Card from '../components/Card'

import s from '../styles/Home.module.css'

export default function Home() {
  let [ active, setActive] = useState('left');
  let [ sketch, setSketch] = useState(() => {});

  const sR = (state, action) => ({
    ...state,
    ...(typeof action === 'function' ? action(state) : action),
  });

  let [ vars, setVars ] = useReducer(sR, {
    func: 'sin(x)',
    guesses: [],
    acc: 1000000
  });

  const cardProps = (t) => {return {
    onClick: () => setActive(t),
    active: active===t,
    setActive,
    type: t,
    setVars,
    vars,
    setSketch,
    sketch: sketch
  }}

  return (
    <div className={s.container}>
      <Head>
        <title>Function Approximator</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div className={ s.cards }>
        <Card { ...cardProps('left') } />
        <Card { ...cardProps('right') } />
      </div>
    </div>
  )
}
