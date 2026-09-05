import * as React from "react";
import { WifiOff } from "lucide-react";
import { BaseState } from "./BaseState";
import type { BaseStateProps } from "@/types/ui-state";

export interface OfflineStateProps extends BaseStateProps {
  /** Optional custom test ID or data attribute */
  "data-testid"?: string;
}

/**
 * Reusable Offline State component built on top of the FarmSmith UI State Foundation.
 * Rendered when the browser loses network connectivity while attempting a data request.
 */
export function OfflineState({
  title = "You're offline",
  description = "Please check your internet connection and try again.",
  icon = <WifiOff size={32} aria-hidden="true" />,
  eyebrow,
  variant = "warning",
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
}: OfflineStateProps) {
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
