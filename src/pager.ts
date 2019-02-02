import mitt from 'mitt';
import ResizeObserver from 'resize-observer-polyfill';

import PagerElement from './pager-element';
import { modulo, clamp, sum, max } from './utils';

const isWindowDefined = (typeof window !== 'undefined');

type PagerOptions = {
  viewsToShow: number,
  viewsToMove: number,
  align: number,
  contain: boolean,
  axis: string, // 'x' or 'y'; perhaps can use the 'x' | 'y' type
  autoSize: boolean,
  infinite: boolean,
  instant: boolean,
  swipe: boolean,
  swipeThreshold: number,
  flickTimeout: number
};

class Track extends PagerElement {
  getStyles(trackPosition: number) {
    const { x, y } = this.pager.getPositionValue(trackPosition);
    const trackSize = this.pager.getTrackSize();
    const style = {
      transform: `translate3d(${x}px, ${y}px, 0)`
    };

    if (trackSize) {
      const { axis, viewsToShow } = this.pager.options;
      const dimension = (axis === 'x') ? 'width' : 'height';

      style[dimension] = this.pager.views.length / viewsToShow * 100 + '%';
    }

    return style;
  }
}

class View extends PagerElement {
  index: number
  inBounds: boolean
  isCurrent: boolean
  isVisible: boolean
  origin: number
  target: number

  constructor({ index, ...restOptions }) {
    super(restOptions);

    this.index = index;
    this.inBounds = true;
    this.setCurrent(false);
    this.setVisible(false);
    this.setTarget();
    this.setOrigin();
  }

  setCurrent(isCurrent: boolean) {
    this.isCurrent = isCurrent;
  }

  setVisible(isVisible: boolean) {
    this.isVisible = isVisible;
  }

  setTarget() {
    const { align } = this.pager.options;
    let target = this.pager.getStartCoords(this.index);

    if (align) {
      target += this.pager.getAlignOffset(this);
    }

    this.target = target;
  }

  setOrigin(trackPosition = this.pager.trackPosition) {
    this.origin = this.target - trackPosition;
  }

  getStyles() {
    const { axis, viewsToShow, infinite } = this.pager.options;
    const style: { [x: string]: any } = {};

    // we need to position views inline when using the x axis
    if (axis === 'x') {
      style.display = 'inline-block';
      style.verticalAlign = 'top';
    }

    // set width or height on view when viewsToShow is not auto
    if (viewsToShow !== 'auto') {
      style[axis === 'x' ? 'width' : 'height'] = 100 / this.pager.views.length + '%';
    }

    // make sure view stays in frame when using infinite option
    if (infinite && !this.inBounds) {
      style.position = 'relative';
      style[(axis === 'y') ? 'top' : 'left'] = this.getPosition();
    }

    return style;
  }
}

const defaultOptions = {
  viewsToShow: 1,
  viewsToMove: 1,
  align: 0,
  contain: false,
  axis: 'x',
  autoSize: false,
  infinite: false,
  instant: false,
  swipe: true,
  swipeThreshold: 0.5,
  flickTimeout: 300
};

class Pager {
  on: Function
  emit: Function
  off: Function
  views: View[]
  currentIndex: number
  currentView: View | null
  currentTween: number
  trackPosition: number
  isSwiping: boolean
  options: PagerOptions
  resizeObserver: ResizeObserver | null
  frame: PagerElement
  track: Track

  constructor(options = {}) {
    // @ts-ignore — mitt typings are incorrect, see https://github.com/developit/mitt/issues/78#issuecomment-422781124
    const emitter = mitt();

    this.on = emitter.on;
    this.emit = emitter.emit;
    this.off = emitter.off;

    this.views = [];
    this.currentIndex = 0;
    this.currentView = null;
    this.currentTween = 0;
    this.trackPosition = 0;
    this.isSwiping = false;

    this.options = {
      ...defaultOptions,
      ...options
    };

    if (isWindowDefined) {
      this.resizeObserver = new ResizeObserver(() => {
        this.hydrate();
      });
    }
  }

  setOptions(options: PagerOptions) {
    const lastOptions = this.options;

    // spread new options over the old ones
    this.options = {
      ...this.options,
      ...options
    };

    // fire a viewChange event with the new indicies if viewsToShow has changed
    if (lastOptions.viewsToShow !== this.options.viewsToShow) {
      this.emit('viewChange', this.getCurrentIndices());
    }
  }

  hydrate = () => {
    this.frame.setSize();
    this.track.setSize();
    this.views.forEach(view => {
      view.setSize();
      view.setTarget();
    });
    this.setPositionValue();
    this.setViewStyles();
    this.emit('hydrated');
  }

  addFrame(node: HTMLElement) {
    this.frame = new PagerElement({
      node,
      pager: this
    });
  }

  addTrack(node: HTMLElement) {
    this.track = new Track({
      node,
      pager: this
    });
  }

  addView(node: HTMLElement) {
    const index = this.views.length;
    const view = new View({
      node,
      index,
      pager: this
    });

    // add view to collection
    this.views.push(view);

    // set this as the first view if there isn't one yet
    if (!this.currentView) {
      this.setCurrentView({
        index,
        suppressEvent: true
      });
    }

    // listen for width and height changes
    if (isWindowDefined && this.resizeObserver) {
      this.resizeObserver.observe(node);
    }

    // fire an event
    this.emit('viewAdded');

    return view;
  }

  removeView(removedView: View) {
    // filter out view
    this.views = this.views.filter(view => view !== removedView);

    // stop observing node
    if (isWindowDefined && this.resizeObserver) {
      this.resizeObserver.unobserve(removedView.node);
    }

    // fire an event
    this.emit('viewRemoved');
  }

  prev() {
    this.setCurrentView({ direction: -1 });
  }

  next() {
    this.setCurrentView({ direction: 1 });
  }

  setCurrentView({ direction = 0, index = this.currentIndex, suppressEvent = false }) {
    const { viewsToMove, infinite } = this.options;
    const newIndex = index + (direction * viewsToMove);

    const previousIndex = this.currentIndex;
    const currentIndex = infinite ? newIndex : clamp(newIndex, 0, this.views.length - 1);

    const previousView = this.getView(previousIndex);
    const currentView = this.getView(currentIndex);

    // set current index and view
    this.currentIndex = currentIndex;
    this.currentView = currentView;

    // swap current view flags
    previousView.setCurrent(false);
    currentView.setCurrent(true);

    // set flags for which views are currently showing
    this.views.forEach((view, index) => {
      view.setVisible(index === currentIndex);
    });

    // set the track position to the new view
    this.setPositionValue();

    if (!suppressEvent) {
      this.emit('viewChange', this.getCurrentIndices());
    }
  }

  setPositionValue(trackPosition = this.currentView ? this.currentView.target : 0) {
    if (!this.isSwiping) {
      const { viewsToShow, autoSize, infinite, contain } = this.options;
      const trackSize = this.getTrackSize();

      if (infinite) {
        // we offset by a track multiplier so infinite animation can take advantage of
        // physics by animating to a large value, the final value provided in getTransformValue
        // will return the proper wrapped value
        trackPosition -= (Math.floor(this.currentIndex / this.views.length) || 0) * trackSize;
      }

      if (contain) {
        const trackEndOffset = (autoSize || viewsToShow <= 1)
          ? 0 : this.getFrameSize({ autoSize: false });
        trackPosition = clamp(trackPosition, trackEndOffset - trackSize, 0);
      }
    }

    this.trackPosition = trackPosition;
  }

  setViewStyles(trackPosition = 0) {
    const { infinite, align } = this.options;
    const trackSize = this.getTrackSize();
    const wrappedTrackPosition = modulo(trackPosition, -trackSize);

    this.views.reduce((lastPosition, view) => {
      const viewSize = view.getSize();
      const nextPosition = lastPosition + viewSize;
      let position = lastPosition;

      if (nextPosition + (viewSize * align) < Math.abs(wrappedTrackPosition)) {
        // shift views around so they are always visible in frame
        if (infinite) {
          position += trackSize - lastPosition;
        }
        view.inBounds = false;
      } else {
        view.inBounds = true;
      }

      view.setPosition(position);
      view.setOrigin(trackPosition);

      return nextPosition;
    }, 0);
  }

  getNumericViewsToShow() {
    const { viewsToShow } = this.options;
    if (typeof viewsToShow === 'number' && isNaN(viewsToShow)) {
      return 1;
    } else {
      return this.options.viewsToShow;
    }
  }

  getMaxDimensions(indices: number[]) {
    const { axis } = this.options;
    const widths: number[] = [];
    const heights: number[] = [];

    indices.forEach(index => {
      if (isNaN(index)) return;
      const view = this.getView(index);

      widths.push(view.getSize('width'));
      heights.push(view.getSize('height'));
    });

    return {
      width: (axis === 'x') ? sum(widths) : max(widths),
      height: (axis === 'y') ? sum(heights) : max(heights)
    };
  }

  getCurrentIndices() {
    const { infinite, contain } = this.options;
    const currentViews: number[] = [];
    const viewsToShow = isNaN(this.options.viewsToShow) ? 1 : this.options.viewsToShow;
    let minIndex = this.currentIndex;
    let maxIndex = this.currentIndex + (viewsToShow - 1);

    if (contain) {
      // if containing, we need to clamp the start and end indexes so we only return what's in view
      minIndex = clamp(minIndex, 0, this.views.length - viewsToShow);
      maxIndex = clamp(maxIndex, 0, this.views.length - 1);
      for (let i = minIndex; i <= maxIndex; i++) {
        currentViews.push(i);
      }
    } else {
      for (let i = minIndex; i <= maxIndex; i++) {
        currentViews.push(infinite
          ? modulo(i, this.views.length)
          : clamp(i, 0, this.views.length - 1)
        );
      }
    }

    return currentViews;
  }

  getFrameSize({ autoSize = this.options.autoSize } = {}) {
    let dimensions = {
      width: 0,
      height: 0
    };

    if (this.views.length) {
      if (autoSize) {
        const currentViews = this.getCurrentIndices();
        dimensions = this.getMaxDimensions(currentViews);
      } else if (this.frame) {
        dimensions = {
          width: this.frame.getSize('width'),
          height: this.frame.getSize('height')
        };
      }
    }

    // FIXME: previously, this function also took fullSize as a parameter,
    // and if fullSize was true, the whole dimensions object got returned,
    // which does not match the expected output type
    return dimensions[this.options.axis === 'x' ? 'width' : 'height'];
  }

  getTrackSize(includeLastSlide = true) {
    const lastIndex = includeLastSlide ? this.views.length : this.views.length - 1;
    let size = 0;
    this.views.slice(0, lastIndex).forEach(view => {
      size += view.getSize();
    });
    return size;
  }

  getView(index: number) {
    return this.views[modulo(index, this.views.length)];
  }

  // where the view should start
  getStartCoords(index: number) {
    let target = 0;
    this.views.slice(0, index).forEach(view => {
      target -= view.getSize();
    });
    return target;
  }

  // how much to offset the view defined by the align option
  getAlignOffset(view: View) {
    const frameSize = this.getFrameSize({ autoSize: false });
    const viewSize = view.getSize();
    return (frameSize - viewSize) * this.options.align;
  }

  getPositionValue(trackPosition = this.trackPosition) {
    const { infinite } = this.options;
    const position = { x: 0, y: 0 };

    // store the current animated value so we can reference it later
    this.currentTween = trackPosition;

    // wrap the track position if this is an infinite track
    if (infinite) {
      const trackSize = this.getTrackSize();
      trackPosition = modulo(trackPosition, -trackSize) || 0;
    }

    // emit a "scroll" event so we can do things based on the progress of the track
    this.emit('scroll', {
      progress: trackPosition / this.getTrackSize(false),
      position: trackPosition
    });

    // set the proper transform axis based on our options
    position[this.options.axis] = trackPosition;

    return position;
  }

  resetViewIndex() {
    // reset back to a normal index
    this.setCurrentView({
      index: modulo(this.currentIndex, this.views.length),
      suppressEvent: true
    });
  }
}

export default Pager;
