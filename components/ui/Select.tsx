"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  label?: string;
  error?: string;
  hint?: string;
  id?: string;
  value?: string;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  onBlur?: () => void;
  name?: string;
  placeholder?: string;
  options: SelectOption[];
  required?: boolean;
  className?: string;
}

export function Select({
  label,
  error,
  hint,
  id,
  value = "",
  onChange,
  onBlur,
  name,
  placeholder = "Select an option",
  options,
  required,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isOpen) {
          setIsOpen(false);
          onBlur?.();
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onBlur]);

  const handleSelect = (val: string) => {
    onChange?.({ target: { value: val, name } });
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5 relative w-full min-w-0" ref={containerRef}>
      {label ? (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-[var(--color-foreground)] max-w-full break-words leading-tight"
        >
          {label}
        </label>
      ) : null}

      {/* Select trigger button */}
      <button
        type="button"
        id={selectId}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={!!error}
        style={{
          height: "2.75rem",
          width: "100%",
          borderRadius: "var(--radius-md)",
          paddingLeft: "0.875rem",
          paddingRight: "2.75rem", // Generous space so text doesn't touch the arrow
          fontSize: "0.875rem",
          textAlign: "left",
          position: "relative",
          background: "var(--color-card)",
          color: selectedOption?.value
            ? "var(--color-foreground)"
            : "var(--color-muted)",
          border: error
            ? "1px solid var(--color-error)"
            : isOpen
            ? "2px solid var(--color-primary)"
            : "1px solid var(--color-border)",
          transition: "border-color 0.15s ease, box-shadow 0.15s ease",
          boxShadow: isOpen ? "0 0 0 2px rgba(31,58,46,0.1)" : "none",
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
        className={cn(className)}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {/* Downside Chevron Arrow (moved inwards from corner) */}
        <span
          style={{
            position: "absolute",
            right: "1.125rem", // Moved slightly left from extreme corner
            top: "50%",
            transform: `translateY(-50%) rotate(${isOpen ? 180 : 0}deg)`,
            transition: "transform 0.2s ease",
            color: "var(--color-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <ChevronDown size={18} />
        </span>
      </button>

      {/* Hidden input for form integration */}
      <input type="hidden" name={name} value={value} required={required} />

      {/* Dropdown Options Popup (Compact, max-h 240px, never full screen) */}
      {isOpen && (
        <div
          role="listbox"
          aria-label={label ?? "Select options"}
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            maxHeight: "240px",
            overflowY: "auto",
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            zIndex: 50,
            padding: "0.375rem",
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                style={{
                  padding: "0.625rem 0.875rem",
                  fontSize: "0.875rem",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: isSelected
                    ? "var(--color-primary)"
                    : "var(--color-foreground)",
                  background: isSelected
                    ? "rgba(31, 58, 46, 0.08)"
                    : "transparent",
                  fontWeight: isSelected ? 600 : 400,
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.background =
                      "var(--color-surface)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                  }
                }}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={16} style={{ color: "var(--color-primary)" }} />}
              </div>
            );
          })}
        </div>
      )}

      {error ? (
        <p id={`${selectId}-error`} role="alert" className="text-xs text-[var(--color-error)]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-hint`} className="text-xs text-[var(--color-muted)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
