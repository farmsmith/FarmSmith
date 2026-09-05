import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { BaseState } from "./BaseState";
import type { BaseStateProps } from "@/types/ui-state";

export interface SuccessStateProps extends BaseStateProps {
  /** Optional custom test ID or data attribute */
  "data-testid"?: string;
}

/**
 * Reusable Success State component built on top of the FarmSmith UI State Foundation.
 * Designed for confirming completed workflows, mutations, and verified operations.
 */
export function SuccessState({
  title = "Operation successful",
  description,
  icon = <CheckCircle2 size={32} aria-hidden="true" />,
  eyebrow,
  variant = "success",
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
}: SuccessStateProps) {
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
