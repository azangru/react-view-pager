import React, { Component, createElement, createRef } from 'react';
import { Spring } from 'react-spring';

import ViewPagerContext from './context';

import Pager from './pager';
import Swipe from './swipe';

type FrameProps = {
  tag?: string,
  autoSize?: boolean | 'width' | 'height',
  style?: { [key: string]: unknown },
  children: React.ReactNode,
  className?: string
  // springConfig
};

type FramePropsWithPager = {
  tag: string,
  autoSize: boolean | 'width' | 'height',
  style?: { [key: string]: unknown },
  children: React.ReactNode,
  className?: string
  pager: Pager
};

class Frame extends Component<FramePropsWithPager> {

  static defaultProps = {
    tag: 'div',
    autoSize: false,
    // springConfig: presets.noWobble
  }

  state = {
    width: 0,
    height: 0,
    instant: true
  };

  swipe: Swipe
  hydrate: boolean
  element = createRef()

  constructor(props: FramePropsWithPager) {
    super(props);

    const { pager, autoSize } = props;
    pager.setOptions({ autoSize });
    this.swipe = new Swipe(pager);
    this.hydrate = false;
  }

  componentDidMount() {
    const { pager } = this.props;

    if (this.element.current instanceof HTMLElement) {
      pager.addFrame(this.element.current);
      // set frame size initially and then based on certain pager events
      this.setFrameSize();

      pager.on('viewChange', this.setFrameSize);
      pager.on('hydrated', this.setFrameSize);
    }
  }

  componentDidUpdate(prevProps: FramePropsWithPager) {
    // update options that have changed
    if (this.props.autoSize !== prevProps.autoSize) {
      this.props.pager.setOptions({ autoSize: this.props.autoSize });
      this.props.pager.hydrate();
    }
  }

  setFrameSize = () => {
    const frameSize = this.props.pager.getFrameSize({ fullSize: true });

    if (typeof frameSize === 'object' && frameSize.width && frameSize.height) {
      this.setState(frameSize, () => {
        // we need to unset the instant flag now that React Motion has dimensions to animate to
        if (this.state.instant) {
          this.setState({ instant: false });
        }
      });
    }
  }

  getFrameStyle() {
    const { width, height } = this.state;
    return {
      maxWidth: width,
      height
    };
  }

  render() {
    const { autoSize } = this.props;
    const style: { [key: string]: unknown }  = {
      position: 'relative',
      overflow: 'hidden'
    };

    if (autoSize) {
      return (
        <Spring to={this.getFrameStyle()}>
          { dimensions => {
            if ((autoSize === true || autoSize === 'width') && dimensions.maxWidth) {
              style.maxWidth = dimensions.maxWidth;
            }
            if ((autoSize === true || autoSize === 'height') && dimensions.height) {
              style.height = dimensions.height;
            }
            return this.renderFrame(style);
          }}
        </Spring>
      );
    } else {
      return this.renderFrame(style);
    }
  }

  renderFrame(style: { [key: string]: unknown }) {
    const { tag, autoSize, pager, ...restProps } = this.props;
    const props = {
      ...this.swipe.getEvents(),
      ...restProps
    };

    return createElement(tag, {
      ...props,
      style: {
        ...style,
        ...props.style
      },
      ref: this.element
    });
  }
}

export default (props: FrameProps) => (
  <ViewPagerContext.Consumer>
    {
      (context) => context && <Frame {...props} pager={context.pager} />
    }
  </ViewPagerContext.Consumer>
);
