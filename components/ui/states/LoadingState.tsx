import * as React from "react";
import { Loader2 } from "lucide-react";
import { BaseState } from "./BaseState";
import type { BaseStateProps } from "@/types/ui-state";

export interface LoadingStateProps extends BaseStateProps {
  /** Optional custom test ID or data attribute */
  "data-testid"?: string;
}

/**
 * Reusable Loading State component built on top of the FarmSmith UI State Foundation.
 * Designed for asynchronous data fetching, page transitions, and authentication checks.
 */
export function LoadingState({
  title = "Loading...",
  description,
  icon,
  eyebrow,
  variant = "default",
  layout = "section",
  primaryAction,
  secondaryAction,
  actions,
  children,
  className,
  style,
  ariaLive = "polite",
  role = "status",
  id,
  "data-testid": dataTestId,
}: LoadingStateProps) {
  const defaultIcon = (
    <Loader2
      size={28}
      className="animate-spin text-[var(--color-primary)]"
      aria-hidden="true"
    />
  );

  return (
    <BaseState
      id={id}
      title={title}
      description={description}
      icon={icon ?? defaultIcon}
      eyebrow={eyebrow}
      variant={variant}
      layout={layout}
      primaryAction={primaryAction}
      secondaryAction={secondaryAction}
      actions={actions}
      className={className}
      style={style}
      ariaLive={ariaLive}
      role={role}
    >
      {children}
    </BaseState>
  );
}
