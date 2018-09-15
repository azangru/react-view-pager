import React from 'react';
import { storiesOf } from '@storybook/react';

import Test from '../src/index';

storiesOf('Test', module)
  .add('with text', () => (
    <Test />
  ));
