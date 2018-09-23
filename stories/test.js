import React from 'react';
import { storiesOf } from '@storybook/react';

import TestCarousel from './components/test-carousel';


storiesOf('Test', module)
  .add('react-view-pager', () => (
    <TestCarousel />
  ));
