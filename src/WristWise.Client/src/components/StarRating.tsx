interface Props {
  rating: number;
  max?: number;
}

export default function StarRating({ rating, max = 5 }: Props) {
  return (
    <span className="flex gap-0.5 text-lg leading-none">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}>
          ★
        </span>
      ))}
    </span>
  );
}
