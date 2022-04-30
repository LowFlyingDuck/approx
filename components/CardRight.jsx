import React from 'react'
import { useRef, useEffect, useState } from 'react'

import { parse, derivative, e } from 'mathjs';

import s from '../styles/Card.module.css'

function drawCircle(ctx, x, y, radius, fill, stroke, strokeWidth=0) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (stroke) {
    ctx.lineWidth = strokeWidth
    ctx.strokeStyle = stroke
    ctx.stroke()
  }
}

let roots = new Set();

export default function CardRight({ vars, setSketch }) {
  let canvas = useRef(null);

  let [ error, setError ] = useState(null);
  let [ inaccurate, setInaccurate ] = useState(false);
  let [ drag, setDrag ] = useState([null]);

  function findRoots(guesses=vars.guesses) {
    setInaccurate(false);

    let f;
    let df;
    let x;
    try {
      f = parse(vars.func);
      x = parse('x');
      df = derivative(f, x);
    } catch(err) {
      return;
    }

    let o = new Set();
    guesses?.forEach(x => {
      let y = 0;
      for (let i=0;i<vars.acc;i++) {
        let m;
        try {
          y = f.evaluate({ x: x });
          m = df.evaluate({ x: x });
          if (y===NaN || y===-Infinity || y===Infinity) return;
        } catch(err) {
          return;
        }
        if (m === 0) {
          x += 2;
          continue;
        }
        x = x - (y / m);
      }
      if (Math.abs(y) > 0.0001) setInaccurate(true);
      o.add(x);
    });

    roots = o;
  }

  let t = null;
  let zoom = 20;
  function zoomHandler(z) {
    z.preventDefault();
    if (typeof t === 'number') {
      window.clearTimeout(t);
    }
    t = window.setTimeout(() => {
      let c = z.deltaY * -0.1;
      if (zoom + c > 0) zoom += c;
      else if (zoom + c < 0) zoom *= 1 / z.deltaY;
      sk();
    }, 500);
  }

  let translate=[ 0, 0 ];
  let dx = 0;
  let dy = 0;
  function dragStart(e) {
    dx = e.clientX;
    dy = e.clientY;
  }
  function dragEnd(e) {
    translate[0] += e.clientX - dx  ;
    translate[1] += e.clientY - dy;

    typeof mouseMove==='function' && mouseMove(e);
    sk(vars);
  }

  function effect() {
    setSketch({sketch: (g) => {
      findRoots(g);
      sk(vars);
    }});
    canvas.current?.addEventListener('wheel', zoomHandler);
    canvas.current?.addEventListener('mousedown', dragStart);
    canvas.current?.addEventListener('mouseup', dragEnd);
    return () => {
      canvas.current?.removeEventListener('wheel', zoomHandler);
      canvas.current?.removeEventListener('mousedown', dragStart);
      canvas.current?.removeEventListener('mouseup', dragEnd);
    }
  }
  useEffect(effect, [ vars ]);

  let f;
  try {
    f = parse(vars.func);
  } catch(err) {
    !error && setError(err.name);
  }

  function sk() {
    if (canvas.current) {
      const {width, height} = canvas.current.getBoundingClientRect();
      canvas.current.width = canvas.current.clientWidth;
      canvas.current.height = canvas.current.clientHeight;

      // let c = document.createElement('canvas').getContext('2d');
      let c = canvas.current.getContext('2d');
      c.strokeStyle = 'black';
      c.lineWidth = 1;

      // clear the canvas
      c.clearRect(0, 0, canvas.width, canvas.height)

      // translate to the current position
      c.translate(translate[0], translate[1]);

      // draw x and y axis
      c.beginPath();
      c.moveTo(-translate[0], height/2);
      c.lineTo(width - translate[0], height/2);
      c.moveTo(width/2, -translate[1]);
      c.lineTo(width/2, height - translate[1]);
      c.stroke();
      c.closePath();

      // plot function
      c.strokeStyle = '#4e0000';
      c.lineWidth = 3;

      // let yCount = zoom;
      // let yScale = height/yCount;
      let yScale = zoom;

      // let xCount = zoom;
      // let xScale = height/xCount;
      let xScale = zoom;
      let xCount = height/xScale;

      
      const map = (n, in_min=0, in_max=width, out_min=-xCount, out_max=xCount) => (n - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;

      const reverseMap = (n, in_min=-xCount, in_max=xCount, out_min=0, out_max=width) => (n - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;

      c.beginPath();
  
      for (let i=-translate[0];i<=width - translate[0];i+=1) {
        let x = map(i);
        let y;
        try {
          f = parse(vars.func);
          y = f.evaluate({ x: x });
          setError(null);
        } catch(err) {
          setError(err);
          return;
        }
        y = height/2 - yScale * y;

        c.lineTo(i, y);
        c.moveTo(i, y);
      }
      c.closePath();
      c.stroke();

      roots.forEach((x) => {
        let i = reverseMap(x);
        let j = height/2 + f.evaluate({ x: x });
        c.beginPath();
        c.setLineDash([ 5, 5 ]);
        c.lineWidth = 1;
        c.strokeStyle = 'hsl(126, 30%, 40%)';
        c.moveTo(i, -translate[1]);
        c.lineTo(i, height - translate[1]);

        c.stroke();
        c.closePath();

        drawCircle(c, i, j, 5, 'hsl(126, 30%, 50%)', 0);

        let [dragx, mx, my] = drag;
        if (dragx === x) {
          // render a box with root position
          let text = 'x = ' + x.toPrecision(8);
          c.font = '18px Inter';
          let measure = c.measureText(text);
          c.fillRect(mx-translate[0], my-translate[1]-8-measure.fontBoundingBoxAscent, measure.width+20, measure.fontBoundingBoxAscent+9);
          c.fillStyle = 'white';
          c.fillText(text, mx+10-translate[0], my-5-translate[1]);
        }
      });
    }
  }
  
  return (
    <>
      {inaccurate && <p className={ s.inaccMsg }>There might be inaccuracies</p>}
      {error && <h2 className={s.error}>{ error.name }</h2>}
      <canvas className={s.canvas} ref={canvas}></canvas>
      <div className={ s.flexDivider }>
        <ul className={ s.list }>
          {roots.size > 0 ? Array.from(roots).map((e) => {
            let y = 0;
            try {
              y = f.evaluate({ x: e }) || 0;
            } catch(err) { }
            return (
              <li key={e}>
                <span>{e.toPrecision(8)}</span>
                <span className={ Math.abs(y)>0.0001 ? s.inaccurate : undefined }>f(x) ≈ { y.toPrecision(8) }</span>
              </li> 
            )
          }) : '{ } '}
          ⊆ {'{'} x | f(x) ≈ 0 {'}'}
        </ul>
        <ul className={ s.list }></ul>
      </div>
    </>
  )
}