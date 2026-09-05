import * as React from "react";
import { StateContainer } from "./StateContainer";
import { StateIcon } from "./StateIcon";
import { StateTitle, StateDescription, StateEyebrow } from "./StateTypography";
import { StateActions } from "./StateActions";
import type { BaseStateProps } from "@/types/ui-state";

export function BaseState({
  title,
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
  ariaLive,
  role,
  id,
}: BaseStateProps) {
  const iconSize = layout === "compact" || layout === "inline" ? "sm" : layout === "card" ? "md" : "lg";
  const isInline = layout === "inline";

  return (
    <StateContainer
      id={id}
      layout={layout}
      variant={variant}
      ariaLive={ariaLive}
      role={role}
      className={className}
      style={style}
    >
      {/* Icon Frame */}
      {icon && (
        <StateIcon
          variant={variant}
          size={iconSize}
          className={isInline ? "mb-0 mr-1" : "mb-4"}
        >
          {icon}
        </StateIcon>
      )}

      {/* Text Content Block */}
      <div
        className={isInline ? "flex-1 min-w-0" : "flex flex-col items-center gap-1.5 max-w-lg"}
      >
        {eyebrow && <StateEyebrow>{eyebrow}</StateEyebrow>}

        {title && (
          <StateTitle as={layout === "page" ? "h1" : isInline ? "h4" : "h2"}>
            {title}
          </StateTitle>
        )}

        {description && (
          <StateDescription className={isInline ? "text-xs md:text-sm mt-0.5" : "mt-1"}>
            {description}
          </StateDescription>
        )}

        {children}
      </div>

      {/* Action Buttons */}
      {(primaryAction || secondaryAction || actions) && (
        <StateActions
          primaryAction={primaryAction}
          secondaryAction={secondaryAction}
          align={isInline ? "end" : "center"}
          className={isInline ? "mt-0 sm:w-auto" : "mt-6"}
        >
          {actions}
        </StateActions>
      )}
    </StateContainer>
  );
}
