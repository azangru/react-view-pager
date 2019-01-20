import React, { PureComponent } from 'react';

import { ViewPager, Frame, Track, View } from '../../src/index';

class Carousel extends PureComponent {

  static defaultProps = {
    viewsToShow: 1,
    infinite: true,
    contain: false
  }

  showPrev = () => {
    this.track && this.track.prev();
  };

  showNext = () => {
    this.track && this.track.next();
  };


  render() {
    const {
      viewsToShow,
      infinite,
    } = this.props;

    return (
      <>
        <ViewPager>
          <Frame className="frame">
            <Track
              className="track"
              ref={ element => this.track = element }
              infinite={infinite}
              viewsToShow={viewsToShow}
            >
              {
                React.Children.map(this.props.children, (child, index) => (
                  <View className="view" key={index}>
                    { child }
                  </View>
                ))
              }
            </Track>
          </Frame>
        </ViewPager>
        { this.renderControls() }
      </>
    );
  }

  renderControls() {
    return (
      <div>
        { this.renderPrevButton() }
        { this.renderNextButton() }
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

export default Carousel;
