import React, { Component, createElement } from 'react';
import PropTypes from 'prop-types';
import Pager from './pager';

const pager = new Pager();
const ViewPagerContext = React.createContext({
  pager
});

class ViewPager extends Component {

  static propTypes = {
    tag: PropTypes.string
  }

  static defaultProps = {
    tag: 'div'
  }

  constructor(props) {
    super(props);

    const forceUpdate = () => this.forceUpdate();

    // re-render the whole tree to update components on certain events
    pager.on('viewChange', forceUpdate);
    pager.on('hydrated', forceUpdate);
  }

  componentDidMount() {
    // run a hydration on the next animation frame to obtain proper targets and positioning
    requestAnimationFrame(() => {
      pager.hydrate();
    });
  }

  render() {
    return (
      <ViewPagerContext.Provider value={{ pager }}>
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
