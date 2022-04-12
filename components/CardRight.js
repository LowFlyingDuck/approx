import { useRef, useEffect, useState } from 'react'

import { parse, derivative } from 'mathjs';

import s from '../styles/Card.module.css'

function drawCircle(ctx, x, y, radius, fill, stroke, strokeWidth) {
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

  let [ error, setError ] = useState();

  function findRoots(guesses=vars.guesses) {
    let f = parse(vars.func);
    let x = parse('x');
    let df = derivative(f, x);

    let o = new Set();

    guesses?.forEach(x => {
      let y = 0;
      for (let i=0;i<vars.acc;i++) {
        let m = df.evaluate({ x: x });
        y = f.evaluate({ x:x });
        if (m === 0) {
          return;
        }
        x = x - (y / m);
      }
      o.add([ x, y ]);
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
      zoom += z.deltaY * -0.1;
      sk(zoom);
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

    sk(zoom);
  }

  var mouseMove = () => {};

  useEffect(() => {
    setSketch({sketch: (g) => {
      findRoots(g);
      sk();
    }});
    canvas.current?.addEventListener('wheel', zoomHandler);
    canvas.current?.addEventListener('mousedown', dragStart);
    canvas.current?.addEventListener('mouseup', dragEnd);
    canvas.current?.addEventListener('mousemove', (e) => mouseMove(e));
    return () => {
      canvas.current?.removeEventListener('wheel', zoomHandler);
      canvas.current?.removeEventListener('mousedown', dragStart);
      canvas.current?.removeEventListener('mouseup', dragEnd);
      canvas.current?.removeEventListener('mousemove', (e) => mouseMove(e));
    }
  }, [ vars ]);

  function sk() {
    if (canvas.current) {
      const {width, height} = canvas.current.getBoundingClientRect();
      canvas.current.width = width;
      canvas.current.height = height;

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

      let f;

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
      try {
        f = parse(vars.func);
      } catch(err) {
        console.log(err);
      }
      for (let i=-translate[0];i<=width - translate[0];i+=1) {
        let x = map(i);
        let y;
        try {
          y = f.evaluate({ x: x });
          setError(null);
        } catch(err) {
          setError(err);
          console.log(err);
          return;
        }
        y = height/2 - yScale * y;

        c.lineTo(i, y);
        c.moveTo(i, y);
      }
      c.closePath();
      c.stroke();

      roots.forEach(([x, y]) => {
        let i = reverseMap(x);
        let j = height/2 + y;
        drawCircle(c, i, j, 5, 'hsl(126, 30%, 40%)', 0);
        c.beginPath();
        c.setLineDash([ 5, 5 ]);

        c.lineWidth = 1;
        c.strokeStyle = 'hsl(126, 30%, 40%)';
        c.moveTo(i, -translate[1]);
        c.lineTo(i, height - translate[1]);

        c.stroke();
        c.closePath();
      });

      mouseMove = e => {
        var cRect = canvas.current.getBoundingClientRect();
        var mx = Math.round(e.clientX - cRect.left);
        var my = Math.round(e.clientY - cRect.top);
    
        roots.forEach(([x, y]) => {
          let i = reverseMap(x);
          let j = height/2 + y;
    
          if (mx > i-5 && mx < i+5) {
            console.log('hello');
            // render a box with root position
            c.font = '24px Inter';
            c.fillText('x = ' + x, i, j);
          } else {
            sk();
          }
        });
      }
    }
  }
  
  return (
    <>
      {error && <h2 className={s.error}>{ error.name }</h2>}
      <canvas className={s.canvas} ref={canvas}></canvas>
      <div className={ s.flexDivider }>
        <ul className={ s.list }></ul>
        <ul className={ s.list }></ul>
      </div>
    </>
  )
}