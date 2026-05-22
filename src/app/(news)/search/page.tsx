import SearchClientLoader from '@/components/search/SearchClientLoader';

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  return (
    <div className='mx-auto max-w-[1400px] px-4 py-6 lg:px-8'>
      <SearchClientLoader initialQuery={q ?? ''} />
    </div>
  );
}
