/* eslint-disable import/prefer-default-export */
import { Iframe } from 'sanity-plugin-iframe-pane';
import type { DefaultDocumentNodeResolver } from 'sanity/desk';
import { SanityDocument } from 'sanity';

// Customise this function to show the correct URL based on the current document
function getPreviewUrl(doc: SanityDocument) {
  return (doc as { slug?: { current?: string } })?.slug?.current
    ? `${window.location.host}/${(doc as { slug?: { current?: string } })?.slug
        ?.current}`
    : `${window.location.host}`;
}

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
          url: (doc: SanityDocument) => getPreviewUrl(doc),
          defaultSize: `desktop`, // default `desktop`
          reload: {
            button: true,
          },
          loader: true,
          attributes: {
            allow: 'fullscreen',
          },
        })
        .title('Preview'),
    ]);
  } else {
    return S.document().views([S.view.form()]);
  }
};
