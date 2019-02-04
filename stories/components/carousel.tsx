import React, { PureComponent } from 'react';

import { ViewPager, Frame, Track, View } from '../../src/index';

type Props = {
  viewsToShow: number,
  infinite: boolean,
  contain: boolean
}

class Carousel extends PureComponent<Props> {

  track: Track | null = null

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
              { this.renderViews() }
            </Track>
          </Frame>
        </ViewPager>
        { this.renderControls() }
      </>
    );
  }

  renderViews() {
    return React.Children.map(this.props.children, (child, index) => (
      <View className="view" key={index}>
        { child as React.ReactElement<any> }
      </View>
    ));
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
      <button onClick={this.showPrev}>
        Previous
      </button>
    );
  }

  renderNextButton() {
    return (
      <button onClick={this.showNext}>
        Next
      </button>
    );
  }

}

export default Carousel;
