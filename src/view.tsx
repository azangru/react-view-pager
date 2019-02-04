import React, { Component, createElement, createRef } from 'react';

import { pickBy, areEqualObjects } from './utils';

import ViewPagerContext from './context';

import Pager, { View as PagerView } from './pager';

type Props = {
  tag?: string,
  style?: object,
  className?: string,
  children: React.ReactNode
};

type ViewPropsWithPager = Props & {
  tag: string,
  pager: Pager
}

function pickComparableProps(props: Props) {
  return pickBy(props, (value, key: string) => !['children', 'pager'].includes(key));
}

class View extends Component<ViewPropsWithPager> {

  static defaultProps = {
    tag: 'div'
  }

  element = createRef()
  viewAdded = false
  viewInstance: PagerView | null = null
  styles = {}

  shouldComponentUpdate(nextProps: Props) {
    const nextPropsForComparison = pickComparableProps(nextProps);
    const currentPropsForComparison = pickComparableProps(this.props);
    return !areEqualObjects(nextPropsForComparison, currentPropsForComparison)
      || !areEqualObjects(this.getStyles(), this.styles);
  }

  componentDidMount() {
    if (this.element.current instanceof HTMLElement) {
      this.viewInstance = this.props.pager.addView(this.element.current);
      this.viewAdded = true;
      this.setStyles();
      this.forceUpdate();
    }
  }

  componentDidUpdate() {
    this.setStyles();
  }

  componentWillUnmount() {
    if (this.viewInstance) {
      this.props.pager.removeView(this.viewInstance);
    }
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
      (context) => context && <View {...props} pager={context.pager} />
    }
  </ViewPagerContext.Consumer>
);
