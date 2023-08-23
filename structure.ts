/* eslint-disable import/prefer-default-export */
import { Iframe } from 'sanity-plugin-iframe-pane';
import type { DefaultDocumentNodeResolver } from 'sanity/desk';
// import { SanityDocument } from 'sanity';

// Customise this function to show the correct URL based on the current document
// function getPreviewUrl(post: SanityDocument) {
//   return post?.slug?.current
//     ? `${window.location.host}/${post.slug?.current}`
//     : `${window.location.host}`
// }

export const getDefaultDocumentNode: DefaultDocumentNodeResolver = (
  S,
  { schemaType },
) => {
  if (schemaType === 'post') {
    return S.document().views([
      S.view.form(),
      S.view
        .component(Iframe)
        .options({
          url: `${
            process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost.3000'
          }/api/preview`,
          defaultSize: `desktop`, // default `desktop`
          reload: {
            button: true,
          },
          loader: true,
          attributes: {
            allow: 'fullscreen', // string, optional
            //   referrerPolicy: 'strict-origin-when-cross-origin', // string, optional
            //   sandbox: 'allow-same-origin', // string, optional
          },
        })
        .title('Preview'),
    ]);
  }
};
