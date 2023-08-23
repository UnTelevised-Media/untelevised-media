/* eslint-disable import/prefer-default-export */
import blockContent from './blockContent';
import post from './post';
import author from './author';
import category from './category';
import comments from './comments';

export const schemaTypes = [post, comments, author, category, blockContent];
