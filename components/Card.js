import React from 'react'

import s from '../styles/Card.module.css'
import CardLeft from './CardLeft.jsx'
import CardRight from './CardRight.jsx'

export default function Card({ type, active, onClick, ...props }) {

  const commons = props;

  return (
    <div
    style={{
      position: 'absolute'
    }}
    onClick={ onClick }
    tabIndex='0' 
    className={[s.card, s[type], active?s.active:s.inactive].join(' ')}
    >
      {
        type === 'left' ? <CardLeft {...commons} /> : <CardRight {...commons} />
      }
    </div>
  )
}
