/* eslint-disable react/function-component-definition */
'use client';

import config from '#/sanity.config';
import NextStudioLoading from 'next-sanity/studio';

export default function Loading() {
    return <NextStudioLoading config={config} />
}