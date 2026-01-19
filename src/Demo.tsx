import React from 'react';

import ReactDOM from 'react-dom/client';

import { EmbedBook } from './EmbedBook';

const href = 'https://www.youtube.com/watch?v=1Vxmsa7zhts';

const EmbedBookCode = EmbedBook(() => <a href={href}>{href}</a>);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <EmbedBookCode
      href={href}
    >{href}</EmbedBookCode>
  </React.StrictMode>,
);
