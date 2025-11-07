// apps/web/src/components/ui/Input.tsx
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-neutral-100">{label}</label>}
      <input
        className={`h-10 px-3 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-violet-300 outline-none ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
