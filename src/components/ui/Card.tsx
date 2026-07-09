import type { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export default function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
