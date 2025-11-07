import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export default function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]",
    secondary: "bg-[var(--bg-soft)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--bg-hover)]",
    ghost: "bg-transparent text-[var(--text)] hover:bg-[var(--bg-hover)]",
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
