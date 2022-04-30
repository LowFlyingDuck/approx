import React from 'react'

import s from '../styles/Card.module.css'
import CardLeft from './CardLeft.jsx'
import CardRight from './CardRight.jsx'

export default function Card({ type, active, onClick, ...props }) {

  const commons = props;

  return (
    <div
    onClick={ onClick }
    className={[s.card, s[type], active?s.active:s.inactive].join(' ')}
    >
      {
        type === 'left' ? <CardLeft {...commons} /> : <CardRight {...commons} />
      }
    </div>
  )
}
