import React, { Component, createElement, createRef } from 'react';
import PropTypes from 'prop-types';

import { pickBy, areEqualObjects } from './utils';

import ViewPagerContext from './context';

import Pager from './pager';

type Props = {
  tag: string,
  pager: Pager,
  style?: object,
  children: JSX.Element
};

function pickComparableProps(props: Props) {
  return pickBy(props, (value, key: string) => !['children', 'pager'].includes(key));
}

class View extends Component<Props> {

  static propTypes = {
    tag: PropTypes.any,
    pager: PropTypes.instanceOf(Pager)
  }

  static defaultProps = {
    tag: 'div'
  }

  element = createRef()
  viewAdded = false
  viewInstance = null
  styles = {}

  shouldComponentUpdate(nextProps: Props) {
    nextProps = pickComparableProps(nextProps);
    const currentProps = pickComparableProps(this.props);
    return !areEqualObjects(nextProps, currentProps) || !areEqualObjects(this.getStyles(), this.styles);
  }

  componentDidMount() {
    if (this.element)
    this.viewInstance = this.props.pager.addView(this.element.current);
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
    const { tag, pager, ...restProps } = this.props;
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

    return createElement(
      tag, {
        ...restProps,
        style,
        ref: this.element
      }
    );
  }
}

export default (props: Props) => (
  <ViewPagerContext.Consumer>
    {
      ({ pager }) => <View {...props} pager={pager} />
    }
  </ViewPagerContext.Consumer>
);
