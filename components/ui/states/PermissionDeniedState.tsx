import * as React from "react";
import { ShieldAlert } from "lucide-react";
import { BaseState } from "./BaseState";
import type { BaseStateProps } from "@/types/ui-state";

export interface PermissionDeniedStateProps extends BaseStateProps {
  /** Optional custom test ID or data attribute */
  "data-testid"?: string;
}

/**
 * Reusable Permission Denied State component built on top of the FarmSmith UI State Foundation.
 * Designed for presenting authenticated access denial or insufficient privilege states
 * with safe recovery actions (e.g., returning to Account or Home).
 */
export function PermissionDeniedState({
  title = "Access Denied",
  description = "You do not have permission to view or manage this resource.",
  icon = <ShieldAlert size={32} aria-hidden="true" />,
  eyebrow,
  variant = "warning",
  layout = "section",
  primaryAction = {
    label: "Go to Account",
    href: "/account",
  },
  secondaryAction = {
    label: "Go Home",
    href: "/",
    variant: "outline",
  },
  actions,
  children,
  className,
  style,
  ariaLive = "polite",
  role = "status",
  id,
  "data-testid": dataTestId,
}: PermissionDeniedStateProps) {
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
