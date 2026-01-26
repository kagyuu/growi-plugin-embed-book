import { h, Properties } from 'hastscript';
import type { Plugin } from 'unified';
import { Node } from 'unist';
import { visit } from 'unist-util-visit';
// import innerText from 'react-innertext';

import './EmbedYouTube.css';

const getYouTubeId = (href: string): string | null => {
  try {
    // https://www.youtube.com/watch?v=xxxxxxx
    const url = new URL(href);
    if (url.host === 'www.youtube.com' && url.pathname === '/watch') {
      const videoId = url.searchParams.get('v');
      if (videoId) return videoId;
    }
  }
  catch (e) {
    // do nothing
  }
  return null;
};

const getBookId = (href: string): string | null => {
  try {
    // https://www.amazon.co.jp/%E3%83%8F%E3%83%B3%E3%82%BA%E3%82%AA%E3%83%B3Node-js-%E4%BB%8A%E6%9D%91-%E8%AC%99%E5%A3%AB/dp/4873119235/
    const url = new URL(href);
    if (url.host === 'www.amazon.co.jp') {
      const bookId = url.pathname.split('/')[3]
      if (bookId) return bookId;
    }
  }
  catch (e) {
    // do nothing
  }
  return null;
};

const getBookName = (href: string): string | null => {
  try {
    // https://www.amazon.co.jp/%E3%83%8F%E3%83%B3%E3%82%BA%E3%82%AA%E3%83%B3Node-js-%E4%BB%8A%E6%9D%91-%E8%AC%99%E5%A3%AB/dp/4873119235/
    const url = new URL(href);
    if (url.host === 'www.amazon.co.jp') {
      const bookName = decodeURI(url.pathname.split('/')[1]);
      if (bookName) return bookName;
    }
  }
  catch (e) {
    // do nothing
  }
  return null;
};

const renderLink = (properties: any, children: string, text = false): JSX.Element => {
  if (text) {
    return (
      <a {...properties}
        dangerouslySetInnerHTML={{ __html: children }}
      ></a>
    );
  } else {
    return (
      <a {...properties}>
        {children}
      </a>
    );
  }
}

export const EmbedYouTube = (A: React.FunctionComponent<any>): React.FunctionComponent<any> => {
  return ({ children, href, ...props }) => {
    const videoId = getYouTubeId(href);
    if (videoId) {
      return (
        <div className="youtube">
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
      );
    }

    const bookId = getBookId(href);
    if (bookId) {
      // if there is a bookId, render the Amazon link
      const bookName = getBookName(href) || bookId;

      if (isIsbn10(bookId)) {
        // convert to ISBN-13
        const isbn13 = isbn10to13(bookId);
        return (
          <div className="book">
            <a href={`${ href }`}>
              <img src={`https://img.hanmoto.com/bd/img/${ isbn13 }.jpg`}/>
              <br/>
              { bookName }
            </a>
          </div>
        );
      }

      return (
        <div className="book">
          <a href={`${ href }`}>
            {bookName}
          </a>
        </div>
      );
    }

    try {
      // only path is ignored
      if (!href.match(/http.?:\/\//)) {
        return renderLink(props.node.properties, children);
      }
      const url = new URL(href);
      if (url.host !== window.location.host) {
        // External link
        if (typeof children === 'string') {
          return renderLink({...props.node.properties, target: '_blank'}, `${children} <span class="growi-custom-icons">external_link</span>`, true);
        } else {
          return renderLink({...props.node.properties, target: '_blank'}, children);
        }
      } else {
        // Internal link
        return renderLink(props.node.properties, children);
      }
    }
    catch (e) {
      // If an error occurs, return the original component
      return renderLink(props.node.properties, children);
    }
  }
};

interface GrowiNode extends Node {
  name: string;
  data: {
    hProperties?: Properties;
    hName?: string;
    hChildren?: Node[] | { type: string, value: string, url?: string }[];
    [key: string]: any;
  };
  type: string;
  attributes: {[key: string]: string}
  children: GrowiNode[] | { type: string, value: string, url?: string }[];
  value: string;
  title?: string;
  url?: string;
}

export const youtubePlugin: Plugin = () => {
  return (tree: Node) => {
    visit(tree, 'leafDirective', (node: Node) => {
      const n = node as unknown as GrowiNode;
      if (n.name !== 'youtube') return;
      const data = n.data || (n.data = {});
      const id = n.children[0].value;
      const {width, height, t} = n.attributes;
      data.hName = 'iframe';
      data.hChildren = [];
      data.hProperties = {
        src: `https://www.youtube.com/embed/${id}?${t ? '?&amp;start=' + t : ''}`,
        width: width || 560,
        height: height || 315,
        frameBorder: 0,
        allow: 'picture-in-picture',
        allowFullScreen: true
      };
    });
  };
};

const isbn10to13 = (code : string) : string => {
  const newCode="978" + code.substring(0,9);
  return newCode + checksum13(newCode);
}

const isbn13to10 = (code : string) : string => {
  const oldCode = code.substring(3,12);
  return oldCode + checksum10(oldCode);
}

const isIsbn10 = (code : string) : boolean => {
  return code.endsWith(checksum10(code));
}

const isIsbn13 = (code : string) : boolean => {
  return code.endsWith(checksum13(code));
}

const checksum10 = (code : string) : string => {
  let sum=0;
  for( let cnt=0 ; cnt<9 ; cnt++ ){
    sum=sum + (code.charCodeAt(cnt)-'0'.charCodeAt(0)) * (10-cnt);
  }
  const checksum = ( 11 - (sum % 11) );
  return checksum == 10 ? "X" : String.fromCharCode('0'.charCodeAt(0) + checksum);
}

const checksum13 = (code : string) : string => {
  var sum=0;
  for(let cnt=0 ; cnt<12 ; cnt++ ){
    sum=sum + (code.charCodeAt(cnt) - '0'.charCodeAt(0)) * (cnt%2==0 ? 1 : 3);
  }
  const checksum = ( 10 - (sum % 10) );
  return String.fromCharCode('0'.charCodeAt(0) + checksum);
};  

