import React from 'react';

import ReactDOM from 'react-dom/client';

import { EmbedBook } from './EmbedBook';

const href = 'https://www.amazon.co.jp/%E3%83%8F%E3%83%B3%E3%82%BA%E3%82%AA%E3%83%B3Node-js-%E4%BB%8A%E6%9D%91-%E8%AC%99%E5%A3%AB/dp/4873119235/';

// const href = 'https://www.amazon.co.jp/Apple-%E3%82%A4%E3%83%B3%E3%83%81-iPad-%E3%82%A4%E3%83%B3%E3%83%81%E3%83%A2%E3%83%87%E3%83%AB%E3%80%81Liquid-%E3%83%87%E3%82%A3%E3%82%B9%E3%83%97%E3%83%AC%E3%82%A4%E3%80%81128GB%E3%80%81Wi-Fi/dp/B0DZ7WF87P/';

const EmbedBookCode = EmbedBook(() => <a href={href}>{href}</a>);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <EmbedBookCode
      href={href}
    >{href}</EmbedBookCode>
  </React.StrictMode>,
);
