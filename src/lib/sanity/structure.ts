import type { StructureResolver } from 'sanity/structure';

// https://www.sanity.io/docs/structure-builder-cheat-sheet
const structure: StructureResolver = (S) =>
  S.list().title('Content').items(S.documentTypeListItems());

export default structure;
