import { Component, createElement } from 'react';

class View extends Component {

  static defaultProps = {
    tag: 'div'
  }

  isViewAdded = false
  viewInstance = null

  // componentDidMount() {
  //   this.viewInstance = this.context.pager.addView(findDOMNode(this))
  //   this._viewAdded = true
  //   this.forceUpdate()
  // }
  //
  // componentWillUnmount() {
  //   this.context.pager.removeView(this._viewInstance)
  // }

  render() {
    const { tag, ...restProps } = this.props;
    let style = this.props.style || {};

    // hide view visually until it has been added to the pager
    // this should help avoid FOUC
    if (!this.isViewAdded) {
      // style.visibility = 'hidden';
      style.pointerEvents = 'none';
    }

    return createElement(tag, { style, ...restProps });
  }
}

export default View;
