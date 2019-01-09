import React, { Component, Children, createElement } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { Spring } from 'react-spring';

import { noop } from './utils';

import ViewPagerContext from './context';

import Pager from './pager';
import getIndex from './get-index';

const checkedProps = {
  tag: PropTypes.any,
  currentView: PropTypes.any,
  viewsToShow: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto'])]),
  viewsToMove: PropTypes.number,
  align: PropTypes.number,
  contain: PropTypes.bool,
  axis: PropTypes.oneOf(['x', 'y']),
  animations: PropTypes.array,
  infinite: PropTypes.bool,
  instant: PropTypes.bool,
  swipe: PropTypes.oneOf([true, false, 'mouse', 'touch']),
  swipeThreshold: PropTypes.number,
  flickTimeout: PropTypes.number,
  springConfig: PropTypes.objectOf(PropTypes.number),
  onSwipeStart: PropTypes.func,
  onSwipeMove: PropTypes.func,
  onSwipeEnd: PropTypes.func,
  onScroll: PropTypes.func,
  onViewChange: PropTypes.func,
  onRest: PropTypes.func,
  pager: PropTypes.instanceOf(Pager)
};

const isNotEqual = (current, next) => (
  current.viewsToShow !== next.viewsToShow ||
  current.viewsToMove !== next.viewsToMove ||
  current.align !== next.align ||
  current.axis !== next.axis ||
  current.animations !== next.animations ||
  current.infinite !== next.infinite ||
  current.swipe !== next.swipe ||
  current.swipeThreshold !== next.swipeThreshold ||
  current.flickTimeout !== next.flickTimeout
);

// Track scroller is an intermediate component that allows us to provide the
// React Motion value to onScroll and lets any user of onScroll use setState
class TrackScroller extends Component {
  static propTypes = checkedProps

  state = {
    x: 0,
    y: 0
  }

  componentDidUpdate(prevProps) {
    const { pager, trackPosition } = this.props;

    // update onScroll callback, we use requestAnimationFrame to avoid bouncing
    // back from updates from onScroll while React Motion is trying to update its own tree
    // https://github.com/chenglou/react-motion/issues/357#issuecomment-262393424
    if (trackPosition !== prevProps.trackPosition) {
      requestAnimationFrame(() =>
        this.props.onScroll((trackPosition / pager.getTrackSize(false)) * -1, trackPosition)
      );
    }
  }

  render() {
    const {
      tag,
      trackPosition,
      pager,
      viewsToShow,
      currentView,
      viewsToMove,
      contain,
      infinite,
      instant,
      swipe,
      swipeThreshold,
      flickTimeout,
      onSwipeStart,
      onSwipeEnd,
      onSwipeMove,
      onViewChange,
      onRest,
      children,
      ...restProps
    } = this.props;

    let style = {
      ...restProps.style
    };

    if (pager.track) {
      style = {
        ...style,
        ...pager.track.getStyles(trackPosition)
      };
    }

    // update view styles with current position tween
    // this method can get called hundreds of times, let's make sure to optimize as much as we can
    // NOTE: this method needs to be called before the views are rendered, so that they always
    // get the updated styles (otherwise the last update may be missed, which will be visible
    // as a flicker in an infinite scroller)
    pager.setViewStyles(trackPosition);

    return createElement(tag, {
      ...restProps,
      style
    }, this.renderViews());
  }

  renderViews() {
    // inject trackPosition as an extra prop into children to make them check whether
    // they need to re-render
    return Children.map(
      this.props.children,
      child => React.cloneElement(child, { trackPosition: this.props.trackPosition })
    );
  }
}

class Track extends Component {
  static propTypes = checkedProps

  static defaultProps = {
    tag: 'div',
    currentView: 0,
    viewsToShow: 1,
    viewsToMove: 1,
    align: 0,
    contain: false,
    axis: 'x',
    infinite: false,
    instant: false,
    swipe: true,
    swipeThreshold: 0.5,
    flickTimeout: 300,
    // springConfig: presets.noWobble,
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

  constructor(props) {
    super(props);
    this.props.pager.setOptions(this.props);
  }

  componentDidMount() {
    const { pager } = this.props;

    // add track to pager
    pager.addTrack(findDOMNode(this));

    // set initial view index and listen for any incoming view index changes
    this.scrollTo(getIndex(this.props.currentView, this.props.children));

    // set values instantly on respective events
    pager.on('hydrated', () => this.setValueInstantly(true, true));
    pager.on('swipeMove', () => this.setValueInstantly(true));
    pager.on('swipeEnd', () => this.setValueInstantly(false));

    // prop callbacks
    pager.on('swipeStart', this.props.onSwipeStart);
    pager.on('swipeMove', this.props.onSwipeMove);
    pager.on('swipeEnd', this.props.onSwipeEnd);
    pager.on('viewChange', this.props.onViewChange);
  }

  componentDidUpdate(prevProps) {
    const { currentView, instant, pager, children } = this.props;

    // update instant state from props
    if (instant !== prevProps.instant) {
      this.setValueInstantly(instant);
    }

    // update state with new index if necessary
    if (currentView !== prevProps.currentView) {
      this.scrollTo(getIndex(currentView, children));
    }

    // update any options that have changed
    if (isNotEqual(this.props, prevProps)) {
      pager.setOptions(this.props);
      pager.hydrate();
    }
  }

  prev() {
    this.props.pager.prev();
  }

  next() {
    this.props.pager.next();
  }

  scrollTo(index) {
    this.props.pager.setCurrentView({ index });
  }

  setValueInstantly(instant, reset) {
    this.setState({ instant }, () => {
      if (reset) {
        this.setState({ instant: false });
      }
    });
  }

  getTrackStyle() {
    return { trackPosition: this.props.pager.trackPosition };
  }

  handleOnRest = () => {
    if (this.props.infinite && !this.state.instant) {
      // reset back to a normal index
      this.props.pager.resetViewIndex();

      // set instant flag so we can prime track for next move
      this.setValueInstantly(true, true);
    }

    this.props.onRest();
  }

  render() {
    return (
      <Spring
        to={this.getTrackStyle()}
        onRest={this.handleOnRest}
        immediate={this.state.instant}
      >
        { ({ trackPosition }) =>
          createElement(TrackScroller, {
            ...this.props,
            trackPosition
          })
        }
      </Spring>
    );
  }
}


export default class TrackWithContext extends Component {

  prev() {
    this.track.prev();
  }

  next() {
    this.track.next();
  }

  scrollTo(index) {
    this.track.scrollTo(index);
  }

  render() {
    return (
      <ViewPagerContext.Consumer>
        {
          ({ pager }) => <Track {...this.props} pager={pager} ref={element => this.track = element}/>
        }
      </ViewPagerContext.Consumer>
    );
  }

}
