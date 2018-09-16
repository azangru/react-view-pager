import React from 'react';

function TestSlide({ imageName }) {
  return (
    <img src={require(`../assets/${imageName}.jpg`)} />
  );
}

export default TestSlide;
