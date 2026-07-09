import { cn } from "../../utils/cn";

function getInitials(name: string): string {
  const parts = name.replace(/^Dr\.?\s*/i, "").trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export default function Avatar({
  name,
  colorClass = "bg-primary-100 text-primary-700",
  size = "md",
}: {
  name: string;
  colorClass?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeClasses = {
    sm: "size-9 text-xs",
    md: "size-12 text-sm",
    lg: "size-16 text-lg",
    xl: "size-24 text-2xl",
  }[size];

  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-full font-semibold", sizeClasses, colorClass)}
    >
      {getInitials(name)}
    </div>
  );
}
