import React from 'react';
import { Spring } from 'react-spring';

function Test() {
  return (
    <Spring
      from={{ translateX: 0 }}
      to={{ translateX: 200 }}
    >
      {({ translateX }) => (
        <h1 style={{ transform: `translateX(${translateX}px)` }}>It works</h1>
      )}
    </Spring>
  );
}

export default Test;

export { default as View } from './view';
export { default as Track } from './track';
