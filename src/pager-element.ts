export type PagerElementOptions = {
  node: HTMLElement,
  pager: object, // Pager instance
  width?: number,
  height?: number
}

class PagerElement {
  node: HTMLElement
  pager: any // FIXME
  x: number
  y: number
  width: number
  height: number

  constructor({ node, pager, width, height }: PagerElementOptions) {
    this.node = node;
    this.pager = pager;
    this.x = this.y = 0;
    this.setSize(width, height);
  }

  setSize(width?: number, height?: number) {
    this.width = width || this.node.offsetWidth;
    this.height = height || this.node.offsetHeight;
  }

  setPosition(position: number) {
    this[this.pager.options.axis] = position;
  }

  getSize(dimension?: string) {
    if (dimension === 'width' || dimension === 'height') {
      return this[dimension];
    } else {
      const axis = this.pager.options.axis;
      return this[axis === 'x' ? 'width' : 'height'];
    }
  }

  getPosition() {
    return this[this.pager.options.axis];
  }
}

export default PagerElement;
