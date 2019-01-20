import React from 'react';
import { storiesOf } from '@storybook/react';

import Carousel from './components/carousel';
import ImageSlide from './components/image-slide';

storiesOf('Single slide per view', module)
  .add('full screen view', () => {
    const imageStyle = { width: '100%', userSelect: 'none' };
    const imageSlides = ['mercy-wallpaper', 'old-tree-wallpaper', 'panda-wallpaper']
      .map(imageName => ({ imageName, imageStyle }))
      .map(imageProps => (<ImageSlide {...imageProps} key={imageProps.name} />));

    return (
      <Carousel>
        { imageSlides }
      </Carousel>
    );
  });

storiesOf('Many slides per view', module)
  .add('full screen view', () => {
    const width = '300px';
    const slides = [ 'pink', 'rebeccapurple', 'dodgerblue', 'linen' ]
      .map(color => (
        <div style={{ background: color, height: '200px' }} key={color} />
      ));

    return (
      <div style={{ width }}>
        <Carousel
          viewsToShow={2}
        >
          { slides }
        </Carousel>
      </div>
    );
  });
