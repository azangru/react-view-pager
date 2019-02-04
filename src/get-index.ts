import React, { Children } from 'react';

export default function getIndex(key: number, children: React.ReactNode) {
  let index: number = 0;

  Children.forEach(children, (child, _index) => {
    if ((child as JSX.Element).key === key || _index === key) {
      index = _index;
    }
  });

  return index;
}
