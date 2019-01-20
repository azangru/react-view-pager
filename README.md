# React-View-Pager

## Summary
This is a slider/carousel/view-pager for React. It is based on the model developed by Travis Arnold in his [`react-view-pager`](https://github.com/souporserious/react-view-pager), with the following differences:

- It is updated for use with the latest version of React: it uses the new React Context, and replaces deprecated methods (such as `findDOMNode`) with up-to-date equivalents.
- It has fixed bugs that appear when using React 16 (such as empty slides in an infinite carousel).
- Instead of `react-motion`, it is based on `react-spring`.

Currently, the functionality of this version of react-view-pager is more limited than of the original view-pager it was modeled on.

_See the [demo](https://azangru.github.io/react-view-pager/)._

## Installation

`npm install --save react react-dom react-spring @azangru/react-view-pager`

## Usage

```
import { ViewPager, Frame, Track, View } from '@azangru/react-view-pager';

<ViewPager>
  <Frame>
    <Track>
      <View>1</View>
      <View>2</View>
      {/* and other views (slides) you want to have in the carousel */}
    </Track>
  </Frame>
</ViewPager>
```

_(see [code example](stories/components/carousel))_
