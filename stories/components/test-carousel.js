import React, { Component } from 'react';

import { ViewPager, Frame, Track, View } from '../../src/index';

import TestSlide from './test-slide';

class TestCarousel extends Component {

  render() {
    return (
      <div>
        <div>
          { this.renderPrevButton() }
          { this.renderNextButton() }
        </div>
        <ViewPager>
          <Frame className="frame">
            <Track
              className="track"
              ref={ element => this.track = element }
              infinite
              viewsToShow={1}
            >
              <View className="view">
                <TestSlide imageName="mercy-wallpaper" />
              </View>
              <View className="view">
                <TestSlide imageName="old-tree-wallpaper" />
              </View>
              <View className="view">
                <TestSlide imageName="panda-wallpaper" />
              </View>
            </Track>
          </Frame>
        </ViewPager>
      </div>
    );
  }

  renderPrevButton() {
    return (
      <button onClick={() => this.track.prev()}>
        Previous
      </button>
    );
  }

  renderNextButton() {
    return (
      <button onClick={() => this.track.next()}>
        Next
      </button>
    );
  }

}

export default TestCarousel;
