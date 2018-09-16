import React, { Component, Children, createElement } from 'react';
import { Spring } from 'react-spring';
import noop from 'lodash/noop';
// import { Motion, spring, presets } from 'react-motion'


// Track scroller is an intermediate component that allows us to provide the
// React Motion value to onScroll and lets any user of onScroll use setState
class TrackScroller extends Component {

  state = {
    x: 0,
    y: 0
  }

  render() {
    const { tag, children, ...restProps } = this.props;
    let style = {
      ...restProps.style
    };

    return createElement(tag, {
      ...restProps,
      style
    }, this.renderViews());
  }

  renderViews() {
    // we need Children map in order for the infinite option to work
    // not actually sure why this is the case
    return Children.map(this.props.children, child => child);
  }
}

class Track extends Component {

  static defaultProps = {
    tag: 'div',
    currentView: 0,
    viewsToShow: 1,
    viewsToMove: 1,
    infinite: false,
    instant: false,
    swipe: true,
    swipeThreshold: 0.5,
    flickTimeout: 300,
    onSwipeStart: noop,
    onSwipeMove: noop,
    onSwipeEnd: noop,
    onScroll: noop,
    onViewChange: noop,
    onRest: noop
  }

  state = {
    instant: false
  }

  currentTween = 0
  hydrate = false

  render() {
    const { tag, onScroll, ...restProps } = this.props;
    return (
      <Spring
        from={{ translateX: 0 }}
        to={{ translateX: 200 }}
        onRest={this.props.onRest}
        >
        { ({ translateX }) =>
          createElement(TrackScroller, {
            style: {
              transform: `translateX(${translateX}px)`,
            },
            tag,
            onScroll,
            ...restProps
          })
        }
      </Spring>
    );
  }
}

export default Track;
