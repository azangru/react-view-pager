import { configure } from '@storybook/react';

function loadStories() {
  require('./stories/test.js');
}

configure(loadStories, module);
