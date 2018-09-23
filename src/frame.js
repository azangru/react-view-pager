import React, { Component, createElement } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { Motion, spring, presets } from 'react-motion';

import { ViewPagerContext } from './view-pager';

import Pager from './Pager';
import Swipe from './Swipe';

const checkedProps = {
  tag: PropTypes.string,
  autoSize: PropTypes.oneOf([true, false, 'width', 'height']),
  springConfig: PropTypes.objectOf(PropTypes.number),
  pager: PropTypes.instanceOf(Pager)
};

class Frame extends Component {

  static propTypes = checkedProps

  static defaultProps = {
    tag: 'div',
    autoSize: false,
    springConfig: presets.noWobble
  }

  state = {
    width: 0,
    height: 0,
    instant: true
  };

  constructor(props) {
    super(props);

    const { pager, autoSize } = this.props;
    pager.setOptions({ autoSize });
    this.swipe = new Swipe(pager);
    this.hydrate = false;
  }

  componentDidMount() {
    const { pager } = this.props;

    pager.addFrame(findDOMNode(this)); // FIXME: use refs?

    // set frame size initially and then based on certain pager events
    this.setFrameSize();

    pager.on('viewChange', this.setFrameSize);
    pager.on('hydrated', this.setFrameSize);
  }

  componentDidUpdate(prevProps) {
    // update options that have changed
    if (this.props.autoSize !== prevProps.autoSize) {
      this.props.pager.setOptions({ autoSize: this.props.autoSize });
      this.props.pager.hydrate();
    }
  }

  setFrameSize = () => {
    const frameSize = this.props.pager.getFrameSize({ fullSize: true });

    if (frameSize.width && frameSize.height) {
      this.setState(frameSize, () => {
        // we need to unset the instant flag now that React Motion has dimensions to animate to
        if (this.state.instant) {
          this.setState({ instant: false });
        }
      });
    }
  }

  getFrameStyle() {
    const { springConfig } = this.props;
    const { width, height, instant } = this.state;
    return {
      maxWidth: instant ? width : spring(width, springConfig),
      height: instant ? height : spring(height, springConfig)
    };
  }

  render() {
    const { autoSize } = this.props;
    const style = {
      position: 'relative',
      overflow: 'hidden'
    };

    if (autoSize) {
      return (
        <Motion style={this._getFrameStyle()}>
          { dimensions => {
            if ((autoSize === true || autoSize === 'width') && dimensions.maxWidth) {
              style.maxWidth = dimensions.maxWidth;
            }
            if ((autoSize === true || autoSize === 'height') && dimensions.height) {
              style.height = dimensions.height;
            }
            return this.renderFrame(style);
          }}
        </Motion>
      );
    } else {
      return this.renderFrame(style);
    }
  }

  renderFrame(style) {
    const { tag } = this.props;
    const props = {
      ...this.swipe.getEvents(),
      ...this.props
    };

    return createElement(tag, {
      ...props,
      style: {
        ...style,
        ...props.style
      }
    });
  }
}

export default (props) => (
  <ViewPagerContext.Consumer>
    {
      ({ pager }) => <Frame {...props} pager={pager} />
    }
  </ViewPagerContext.Consumer>
);
