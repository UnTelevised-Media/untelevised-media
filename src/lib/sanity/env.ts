export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2025-06-04';

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET'
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID'
);

  //  Set the Studio URL Also used to configure edit intent links, for Presentation Mode
  export const studioUrl = '/studio';
  
  // CMS Studio Title
  export const title = process.env.NEXT_PUBLIC_SANITY_PROJECT_TITLE || 'UnTelevised Studio';
  
  // See the app/api/revalidate/route.ts for how this is used
  export const revalidateSecret = process.env.SANITY_REVALIDATE_SECRET;
  


function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }

  return v;
}
