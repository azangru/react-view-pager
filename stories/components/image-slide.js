import React from 'react';

function ImageSlide({ imageName, imageStyle }) {
  return (
    <img src={require(`../assets/${imageName}.jpg`)} style={imageStyle} />
  );
}

export default ImageSlide;
