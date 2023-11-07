/* eslint-disable import/prefer-default-export */
import blockContent from './blockContent';
import post from './post';
import author from './author';
import category from './category';
import comments from './comments';
import liveEvent from './liveEvent';
import keyEvent from './keyEvent';
import eventTag from './eventTag';
import twitterX from './twitterX';
import instagram from './instagram';

export const schemaTypes = [
  post,
  author,
  category,
  blockContent,
  comments,
  liveEvent,
  keyEvent,
  eventTag,
  twitterX,
  instagram,
];
