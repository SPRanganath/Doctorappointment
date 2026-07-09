import { Star } from "lucide-react";
import { cn } from "../../utils/cn";

export default function RatingStars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= Math.round(rating);
        return (
          <Star
            key={i}
            size={size}
            className={cn(filled ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")}
          />
        );
      })}
    </div>
  );
}
