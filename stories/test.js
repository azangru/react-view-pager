import React from 'react';
import { storiesOf } from '@storybook/react';

import Test, { View, Track } from '../src/index';

import TestSlide from './components/test-slide';

storiesOf('Test', module)
  .add('with text', () => (
    <div>
      <Test />
      <Track>
        <View>
          <TestSlide imageName="mercy-wallpaper" />
        </View>
        <View>
          <TestSlide imageName="old-tree-wallpaper" />
        </View>
        <View>
          <TestSlide imageName="panda-wallpaper" />
        </View>
      </Track>
    </div>
  ));
