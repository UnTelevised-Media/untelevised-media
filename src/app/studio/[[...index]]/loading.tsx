
'use client';

import config from '#/sanity.config';
import NextStudioLoading from 'next-sanity/studio';

const Loading = () => {
    return <NextStudioLoading config={config} />;
}

export default Loading;