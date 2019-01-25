import React, { Component, createElement } from 'react';
import PropTypes from 'prop-types';

import ViewPagerContext from './context';
import Pager from './pager';

class ViewPager extends Component {

  static propTypes = {
    tag: PropTypes.string
  }

  static defaultProps = {
    tag: 'div'
  }

  constructor(props) {
    super(props);

    this.pager = new Pager();
    const forceUpdate = () => this.forceUpdate();

    // re-render the whole tree to update components on certain events
    this.pager.on('viewChange', forceUpdate);
    this.pager.on('hydrated', forceUpdate);
  }

  componentDidMount() {
    // run a hydration on the next animation frame to obtain proper targets and positioning
    requestAnimationFrame(() => {
      this.pager.hydrate();
    });
  }

  render() {
    return (
      <ViewPagerContext.Provider value={{ pager: this.pager }}>
        { this.renderViewPager() }
      </ViewPagerContext.Provider>
    );
  }

  renderViewPager() {
    const { tag, ...restProps } = this.props;
    return createElement(tag, restProps);
  }
}


export { ViewPagerContext };
export default ViewPager;
