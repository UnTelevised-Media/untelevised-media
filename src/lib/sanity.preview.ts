/* eslint-disable import/prefer-default-export */
'use client'

import { definePreview } from 'next-sanity/preview';
import { projectId, dataset } from './sanity.client';

function onPublicAccessOnly() {
    throw new Error('Please login to the studio to view the previews');
}

if (!projectId || !dataset) {
    throw new Error('Missing the ProjectID and/or the dataset. Please check sanity.json or .env config files');
}

export const usePreview = definePreview({
    projectId,
    dataset,
    onPublicAccessOnly,
});