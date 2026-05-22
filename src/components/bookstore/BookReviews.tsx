// src/components/bookstore/BookReviews.tsx
// Server component — displays approved reviews for a book.

interface Review {
  _id: string;
  reviewerName: string;
  reviewerLocation?: string;
  rating: number;
  body: string;
  submittedAt: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className='flex gap-0.5' aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}>
          ★
        </span>
      ))}
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface Props {
  reviews: Review[];
  bookSlug: string;
}

export default function BookReviews({ reviews }: Props) {
  return (
    <div className='mb-6'>
      <div className='mb-4 flex items-center gap-3'>
        <div className='bg-untele px-2 py-0.5'>
          <span className='text-[10px] font-black uppercase tracking-widest text-white'>
            Reader Reviews
          </span>
        </div>
        {reviews.length > 0 && (
          <span className='text-[10px] font-bold text-hp-muted'>
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className='border border-hp-sand-border bg-hp-sand px-4 py-6 text-center dark:border-hp-dark-border dark:bg-hp-dark-card'>
          <p className='text-xs font-bold uppercase tracking-widest text-hp-muted'>
            No reviews yet. Be the first.
          </p>
        </div>
      ) : (
        <div className='flex flex-col gap-4'>
          {reviews.map((review) => (
            <div
              key={review._id}
              className='border border-hp-sand-border bg-white p-4 dark:border-hp-dark-border dark:bg-hp-dark-card'
            >
              <div className='mb-2 flex flex-wrap items-center gap-3'>
                <StarRating rating={review.rating} />
                <div>
                  <span className='text-sm font-black text-slate-900 dark:text-hp-cream'>
                    {review.reviewerName}
                  </span>
                  {review.reviewerLocation && (
                    <span className='ml-2 text-[10px] font-bold text-hp-muted'>
                      {review.reviewerLocation}
                    </span>
                  )}
                </div>
                <span className='ml-auto text-[10px] text-hp-muted'>
                  {formatDate(review.submittedAt)}
                </span>
              </div>
              <p className='text-sm leading-relaxed text-slate-700 dark:text-hp-cream'>
                {review.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
