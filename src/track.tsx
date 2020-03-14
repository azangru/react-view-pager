import React, {
  Component,
  Children,
  createElement,
  createRef,
  ReactElement,
  useState,
  useEffect,
  useContext,
  useImperativeHandle,
  forwardRef,
  RefForwardingComponent
} from 'react';
// import { useSpring } from 'react-spring';
import { Spring } from 'react-spring/renderprops';

import { noop } from './utils';

import ViewPagerContext from './context';

import Pager from './pager';
import getIndex from './get-index';

export type TrackProps = {
  tag?: string,
  currentView?: number,
  viewsToShow?: number,
  viewsToMove?: number,
  align?: number,
  contain?: boolean,
  axis?: 'x' | 'y',
  infinite?: boolean,
  instant?: boolean,
  swipe?: boolean | 'mouse' | 'touch',
  swipeThreshold?: number,
  flickTimeout?: number,
  onSwipeStart?: Function,
  onSwipeMove?: Function,
  onSwipeEnd?: Function,
  onScroll?: Function,
  onViewChange?: Function,
  onRest?: Function,
  style?: { [key: string]: string | number }
  children: React.ReactNode,
  className?: string
  // Currently not used compared to souporserious/react-view-pager
  // springConfig
  // animations — currently not used
}

type TrackWithPagerProps = {
  tag: string,
  currentView: number,
  viewsToShow: number,
  viewsToMove: number,
  align: number,
  contain: boolean,
  axis: 'x' | 'y',
  infinite: boolean,
  instant: boolean,
  swipe: boolean | 'mouse' | 'touch',
  swipeThreshold: number,
  flickTimeout: number,
  onSwipeStart: Function,
  onSwipeMove: Function,
  onSwipeEnd: Function,
  onScroll: Function,
  onViewChange: Function,
  onRest: Function,
  children: React.ReactNode,
  style?: { [key: string]: string | number }
  className?: string,
  pager: Pager
};

type TrackScrollerProps = TrackWithPagerProps & {
  trackPosition: number
}

// Track scroller is an intermediate component that allows us to provide
// React Spring with a value to onScroll and lets any user of onScroll use setState
class TrackScroller extends Component<TrackScrollerProps> {

  state = {
    x: 0,
    y: 0
  }

  element = createRef()

  componentDidMount() {
    if (this.element.current instanceof HTMLElement) {
      this.props.pager.addTrack(this.element.current);
    }
  }

  componentDidUpdate(prevProps: TrackScrollerProps) {
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
      style,
      ref: this.element
    }, this.renderViews());
  }

  renderViews() {
    // it's a bit crazy, but without the Children.map (that does nothing!) infinite carousel will
    // contain empty slides
    return Children.map(
      this.props.children,
      child => React.cloneElement(child as ReactElement)
    );
  }
}

type TrackHandles = {
  prev: () => void;
  next: () => void;
  scrollTo: (slideIndex: number) => void
};


const optionalTrackProps = {
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
  onSwipeStart: noop,
  onSwipeMove: noop,
  onSwipeEnd: noop,
  onScroll: noop,
  onViewChange: noop,
  onRest: noop
};

const Track: RefForwardingComponent<TrackHandles, TrackWithPagerProps> = (
  props: TrackWithPagerProps,
  ref
) => {
  const context = useContext(ViewPagerContext);
  if (!context) return null;
  props = { ...optionalTrackProps, ...props };
  const pager = context.pager;
  const [isInstant, setIsInstant] = useState(false);

  useEffect(() => {
    pager.setOptions(props);
  }, []);

  useEffect(() => {
    // set initial view index and listen for any incoming view index changes
    scrollTo(getIndex(props.currentView, props.children));

    // set values instantly on respective events
    pager.on('hydrated', () => setValueInstantly(true, true));
    pager.on('swipeMove', () => setValueInstantly(true));
    pager.on('swipeEnd', () => setValueInstantly(false));

    // prop callbacks
    pager.on('swipeStart', props.onSwipeStart);
    pager.on('swipeMove', props.onSwipeMove);
    pager.on('swipeEnd', props.onSwipeEnd);
    pager.on('viewChange', props.onViewChange);
  }, []);

  useEffect(() => {
    setValueInstantly(props.instant)
  }, [props.instant]);

  useEffect(() => {
    scrollTo(getIndex(props.currentView, props.children));
  }, [props.currentView]);

  useEffect(() => {
    pager.setOptions(props);
    pager.hydrate();
  }, [
    props.viewsToShow,
    props.viewsToMove,
    props.align,
    props.axis,
    props.infinite,
    props.swipe,
    props.swipeThreshold,
    props.flickTimeout
  ]);

  useImperativeHandle(ref, () => ({
    prev: () => {
      pager.prev();
    },
    next() {
      pager.next();
    },
    scrollTo
  }));

  const scrollTo = (index: number) => {
    pager.setCurrentView({ index });
  };

  const setValueInstantly = (instant: boolean, reset?: boolean) => {
    instant = reset ? false : instant;
    setIsInstant(instant);
  };

  const handleOnRest = () => {
    if (props.infinite && !isInstant) {
      // reset back to a normal index
      pager.resetViewIndex();

      // set instant flag so we can prime track for next move
      setValueInstantly(true, true);
    }

    props.onRest();
  };

  console.log('pager.trackPosition', pager.trackPosition);

  return (
    <Spring
      to={{trackPosition: pager.trackPosition}}
      onRest={handleOnRest}
      immediate={isInstant}
    >
      { ({ trackPosition }) =>
        createElement(TrackScroller, {
          ...props,
          trackPosition,
          pager
        })
      }
    </Spring>
  );


  // return createElement(TrackScroller, {
  //   ...props,
  //   pager,
  //   trackPosition: spring.trackPosition.value
  // });

}

export default forwardRef(Track);
