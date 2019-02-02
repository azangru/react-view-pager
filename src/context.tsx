import React from 'react';

import Pager from './pager';

interface ContextInterface {
  pager: Pager
}

const ViewPagerContext = React.createContext<ContextInterface | null>(null);

export default ViewPagerContext;
