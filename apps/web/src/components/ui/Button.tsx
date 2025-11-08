// apps/web/src/components/ui/Button.tsx
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export default function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-violet-600 text-white hover:bg-violet-700",
    secondary: "bg-neutral-800 text-neutral-100 border border-neutral-700 hover:bg-neutral-700",
    ghost: "bg-transparent text-neutral-100 hover:bg-neutral-800",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };
  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-5 text-base",
  };
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  return <button className={classes} {...props} />;
}
