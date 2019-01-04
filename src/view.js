import React, { Component, createElement } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import isEqual from 'lodash/isEqual';
import pickBy from 'lodash/pickBy';

import ViewPagerContext from './context';

import Pager from './pager';

function withoutTrackPosition(props) {
  return pickBy(props, (value, key) => key !== 'trackPosition');
}

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
  styles = {}

  shouldComponentUpdate(nextProps) {
    nextProps = withoutTrackPosition(nextProps);
    const currentProps = withoutTrackPosition(this.props);
    return !isEqual(nextProps, currentProps) || !isEqual(this.getStyles(), this.styles);
  }

  componentDidMount() {
    this.viewInstance = this.props.pager.addView(findDOMNode(this)); // FIXME use refs?
    this.viewAdded = true;
    this.setStyles();
    this.forceUpdate();
  }

  componentDidUpdate() {
    this.setStyles();
  }

  componentWillUnmount() {
    this.props.pager.removeView(this.viewInstance);
  }

  setStyles() {
    this.styles = this.getStyles();
  }

  getStyles() {
    return this.viewInstance ? this.viewInstance.getStyles() : {};
  }

  render() {
    const { pager, tag, trackSize, ...restProps } = this.props;
    let style = {
      ...restProps.style,
      ...this.getStyles()
    };

    // hide view visually until it has been added to the pager
    // this should help avoid FOUC
    if (!this.viewAdded) {
      style.visibility = 'hidden';
      style.pointerEvents = 'none';
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
