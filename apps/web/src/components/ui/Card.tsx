// apps/web/src/components/ui/Card.tsx
type CardProps = {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export default function Card({ title, subtitle, children, footer, className = "" }: CardProps) {
  return (
    <div className={`rounded-lg bg-neutral-900 border border-neutral-700 shadow-lg ${className}`}>
      {(title || subtitle) && (
        <div className="p-4 border-b border-neutral-700">
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          {subtitle && <p className="text-sm text-neutral-400">{subtitle}</p>}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && <div className="p-4 border-t border-neutral-700">{footer}</div>}
    </div>
  );
}
