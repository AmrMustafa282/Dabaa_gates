import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "success" | "destructive" | "warning" | "secondary";
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          default: "border-transparent bg-primary text-primary-foreground",
          success: "border-transparent bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          destructive: "border-transparent bg-red-500/15 text-red-400 border-red-500/30",
          warning: "border-transparent bg-amber-500/15 text-amber-400 border-amber-500/30",
          secondary: "border-transparent bg-secondary text-secondary-foreground",
        }[variant],
        className
      )}
      {...props}
    />
  );
}
