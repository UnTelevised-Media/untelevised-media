export function buildArticleExclusionFilter(excludedIds: string[]): string {
  if (excludedIds.length === 0) return '';
  return `&& !(_id in [${excludedIds.map((id) => `"${id}"`).join(', ')}]) && !(slug.current in [${excludedIds.map((id) => `"${id}"`).join(', ')}])`;
}
