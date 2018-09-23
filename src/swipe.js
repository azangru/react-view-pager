function getTouchEvent(e) {
  return e.touches && e.touches[0] || e;
}

class Swipe {

  constructor(pager) {
    this.pager = pager;
    this.trackStart = false;
    this.swipeStart = this.swipeDiff = {
      x: 0,
      y: 0
    };
  }

  isSwipe(threshold) {
    const { x, y } = this.swipeDiff;
    return this.pager.options.axis === 'x'
      ? Math.abs(x) > Math.max(threshold, Math.abs(y))
      : Math.abs(x) < Math.max(threshold, Math.abs(y));
  }

  onSwipeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { pageX, pageY } = getTouchEvent(e);

    // we're now swiping
    this.pager.isSwiping = true;

    // store the initial starting coordinates
    this.swipeStart = {
      x: pageX,
      y: pageY
    };

    // reset swipeDiff
    this.swipeDiff = {
      x: 0,
      y: 0
    };

    // determine if a flick or not
    this.isFlick = true;

    setTimeout(() => {
      this.isFlick = false;
    }, this.pager.options.flickTimeout);

    this.pager.emit('swipeStart');
  }

  onSwipeMove = (e) =>  {
    // bail if we aren't swiping
    if (!this.pager.isSwiping) return;

    const { swipeThreshold, axis } = this.pager.options;
    const { pageX, pageY } = getTouchEvent(e);

    // grab the current position of the track before
    if (!this.trackStart) {
      this.trackStart = this.pager.currentTween;
    }

    // determine how much we have moved
    this.swipeDiff = {
      x: this.swipeStart.x - pageX,
      y: this.swipeStart.y - pageY
    };

    if (this.isSwipe(swipeThreshold)) {
      e.preventDefault();
      e.stopPropagation();

      const swipeDiff = this.swipeDiff[axis];
      const trackPosition = this.trackStart - swipeDiff;

      this.pager.setPositionValue(trackPosition);

      this.pager.emit('swipeMove');
    }
  }

  onSwipeEnd = () =>  {
    const { swipeThreshold, viewsToMove, axis } = this.pager.options;
    const threshold = this.isFlick
      ? swipeThreshold
      : (this.pager.currentView.getSize() * viewsToMove) * swipeThreshold;

    // we've stopped swiping
    this.pager.isSwiping = false;

    // reset start track so we can grab it again on the next swipe
    this.trackStart = false;

    // don't move anything if there hasn't been an attempted swipe
    if (this.swipeDiff.x || this.swipeDiff.y) {
      // determine if we've passed the defined threshold
      if (this.isSwipe(threshold)) {
        if (this.swipeDiff[axis] < 0) {
          this.pager.prev();
        } else {
          this.pager.next();
        }
      }
      // if we didn't, reset back to original view
      else {
        this.pager.setPositionValue();
      }
    }

    this.pager.emit('swipeEnd');
  }

  onSwipePast = () =>  {
    // perform a swipe end if we swiped past the component
    if (this.pager.isSwiping) {
      this.onSwipeEnd();
    }
  }

  getEvents() {
    const { swipe } = this.pager.options;
    let swipeEvents = {};

    if (swipe === true || swipe === 'mouse') {
      swipeEvents.onMouseDown = this.onSwipeStart;
      swipeEvents.onMouseMove = this.onSwipeMove;
      swipeEvents.onMouseUp = this.onSwipeEnd;
      swipeEvents.onMouseLeave = this.onSwipePast;
    }

    if (swipe === true || swipe === 'touch') {
      swipeEvents.onTouchStart = this.onSwipeStart;
      swipeEvents.onTouchMove = this.onSwipeMove;
      swipeEvents.onTouchEnd = this.onSwipeEnd;
    }

    return swipeEvents;
  }
}

export default Swipe;
