import React from "react";

type CardProps = {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export default function Card({ title, subtitle, children, footer, className = "" }: CardProps) {
  return (
    <div className={`rounded-lg bg-[var(--bg-soft)] border border-[var(--border)] shadow-lg ${className}`}>
      {(title || subtitle) && (
        <div className="p-4 border-b border-[var(--border)]">
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          {subtitle && <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && <div className="p-4 border-t border-[var(--border)]">{footer}</div>}
    </div>
  );
}
