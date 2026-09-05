import * as React from "react";
import { Package } from "lucide-react";
import { BaseState } from "./BaseState";
import type { BaseStateProps } from "@/types/ui-state";

export interface EmptyStateProps extends BaseStateProps {
  /** Optional custom test ID or data attribute */
  "data-testid"?: string;
}

/**
 * Reusable Empty State component built on top of the FarmSmith UI State Foundation.
 * Designed for situations where a query/collection resolves successfully but yields zero records.
 */
export function EmptyState({
  title = "No items found",
  description,
  icon = <Package size={28} aria-hidden="true" />,
  eyebrow,
  variant = "neutral",
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
}: EmptyStateProps) {
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
