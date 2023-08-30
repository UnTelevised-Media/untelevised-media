'use client'

import { init } from 'shareon';
import 'shareon/css';

init();

const ShareButtons = () => {
  return (
    <div>
      <div className='shareon'>
        <a className='facebook' />
        <a className='linkedin' />
        <a className='mastodon' />
        <a className='messenger' data-fb-app-id='0123456789012345' />

        <a className='pinterest' />

        <a className='reddit' />
        <a className='teams' />
        <a className='telegram' />
        <a className='tumblr' />
        <a className='twitter' />

        <a className='whatsapp' />
        <a className='copy-url' />
      </div>
    </div>
  );
};

export default ShareButtons;