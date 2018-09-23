import React, { Component, createElement } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';

import { ViewPagerContext } from './view-pager';

import Pager from './pager';

class View extends Component {

  static propTypes = {
    tag: PropTypes.any,
    pager: PropTypes.instanceOf(Pager)
  }

  static defaultProps = {
    tag: 'div'
  }

  viewAdded = false
  viewInstance = null

  componentDidMount() {
    this.viewInstance = this.props.pager.addView(findDOMNode(this)); // FIXME use refs?
    this.viewAdded = true;
    this.forceUpdate();
  }

  componentWillUnmount() {
    this.props.pager.removeView(this.viewInstance);
  }

  render() {
    const { pager, tag, trackSize, ...restProps } = this.props;
    let style = {
      ...restProps.style
    };

    // hide view visually until it has been added to the pager
    // this should help avoid FOUC
    if (!this.viewAdded) {
      style.visibility = 'hidden';
      style.pointerEvents = 'none';
    }

    if (this.viewInstance) {
      style = {
        ...style,
        ...this.viewInstance.getStyles()
      };
    }

    return createElement(tag, { ...restProps, style });
  }
}

export default (props) => (
  <ViewPagerContext.Consumer>
    {
      ({ pager }) => <View {...props} pager={pager} />
    }
  </ViewPagerContext.Consumer>
);
