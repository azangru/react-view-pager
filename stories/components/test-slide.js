import React from 'react';

function TestSlide({ imageName }) {
  return (
    <img src={require(`../assets/${imageName}.jpg`)} style={{ width: '100%', userSelect: 'none' }} />
  );
}

export default TestSlide;
