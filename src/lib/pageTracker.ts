/* eslint-disable import/prefer-default-export */

// via https://github.com/vercel/next.js/blob/86a0c7b0f7133362b5a5358428fe8ca334fe394e/examples/with-google-analytics/lib/gtag.js

export const pageView = (url: string) => {
  window.gtag('config', process.env.GOOGLEANALYTICS_ID, {
    page_path: url,
  });
}
