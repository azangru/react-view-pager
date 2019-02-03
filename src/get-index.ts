import { Children } from 'react';

export default function getIndex(key: number, children: JSX.Element[] | JSX.Element) {
  let index: number = 0;

  Children.forEach(children, (child, _index) => {
    if (child.key === key || _index === key) {
      index = _index;
    }
  });

  return index;
}
