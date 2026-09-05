import * as React from "react";
import { LogIn, KeyRound } from "lucide-react";
import { BaseState } from "./BaseState";
import type { BaseStateProps } from "@/types/ui-state";

export interface SessionExpiredStateProps extends BaseStateProps {
  /** Optional redirect URL after login */
  redirectUrl?: string;
  /** Optional custom test ID or data attribute */
  "data-testid"?: string;
}

/**
 * Reusable Session Expired State component built on top of the FarmSmith UI State Foundation.
 * Designed for presenting expired or revoked authentication sessions with clear, safe sign-in recovery actions.
 */
export function SessionExpiredState({
  title = "Your session has expired",
  description = "For your security, please sign in again to continue accessing your account.",
  icon = <KeyRound size={32} aria-hidden="true" />,
  eyebrow = "Authentication Required",
  variant = "warning",
  layout = "section",
  redirectUrl,
  primaryAction = {
    label: "Sign In Again",
    href: redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : "/login",
    icon: <LogIn size={16} aria-hidden="true" />,
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
}: SessionExpiredStateProps) {
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
