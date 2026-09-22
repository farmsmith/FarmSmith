import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement> | { target: { value: string; name?: string } }) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      hint,
      id,
      options,
      value = "",
      onChange,
      required,
      ...props
    },
    ref
  ) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const isPlaceholderSelected = !value || value === "";

    return (
      <div className="flex flex-col gap-1.5 w-full min-w-0">
        {label ? (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-[var(--color-foreground)] max-w-full break-words leading-tight"
          >
            {label}
          </label>
        ) : null}

        <div className="relative flex items-center w-full min-w-0">
          <select
            id={selectId}
            ref={ref}
            value={value}
            onChange={(e) => onChange?.(e)}
            required={required}
            className={cn(
              "h-11 w-full min-w-0 rounded-[var(--radius-md)] border pl-3.5 pr-10 text-sm",
              "bg-[var(--color-card)]",
              isPlaceholderSelected
                ? "text-[var(--color-muted)]"
                : "text-[var(--color-foreground)]",
              "appearance-none cursor-pointer",
              "transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent",
              error
                ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
                : "border-[var(--color-border)]",
              className
            )}
            style={{
              WebkitAppearance: "none",
              MozAppearance: "none",
              appearance: "none",
            }}
            aria-describedby={
              error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined
            }
            aria-invalid={!!error}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                style={{
                  color: opt.value ? "var(--color-foreground)" : "var(--color-muted)",
                  background: "var(--color-card)",
                }}
              >
                {opt.label}
              </option>
            ))}
          </select>

          {/* Clean Custom Chevron Down Icon */}
          <div
            className="absolute right-3.5 flex items-center justify-center pointer-events-none text-[var(--color-muted)]"
            aria-hidden="true"
          >
            <ChevronDown size={18} />
          </div>
        </div>

        {error ? (
          <p
            id={`${selectId}-error`}
            role="alert"
            className="text-xs text-[var(--color-error)]"
          >
            {error}
          </p>
        ) : hint ? (
          <p
            id={`${selectId}-hint`}
            className="text-xs text-[var(--color-muted)]"
          >
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
