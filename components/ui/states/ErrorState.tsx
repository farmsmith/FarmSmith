import * as React from "react";
import { AlertCircle } from "lucide-react";
import { BaseState } from "./BaseState";
import type { BaseStateProps } from "@/types/ui-state";

export interface ErrorStateProps extends BaseStateProps {
  /** Optional custom test ID or data attribute */
  "data-testid"?: string;
}

/**
 * Reusable Error State component built on top of the FarmSmith UI State Foundation.
 * Designed for presenting user-safe failure conditions with clear recovery actions.
 */
export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  icon = <AlertCircle size={32} aria-hidden="true" />,
  eyebrow,
  variant = "error",
  layout = "section",
  primaryAction,
  secondaryAction,
  actions,
  children,
  className,
  style,
  ariaLive = "assertive",
  role = "alert",
  id,
  "data-testid": dataTestId,
}: ErrorStateProps) {
  return (
    <BaseState
      id={id}
      title={title}
      description={description}
      icon={icon}
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
