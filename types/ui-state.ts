import type { ReactNode } from "react";
import type { ButtonProps } from "@/components/ui/Button";

export type UIStateVariant =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "neutral";

export type UIStateLayout =
  | "page"      // Full-page centered view (e.g. 404, Offline, Fatal error)
  | "section"   // Section-level state (e.g. empty shop catalog, order history)
  | "card"      // Contained inside a Card component
  | "inline"    // Small banner / alert box (e.g. form validation alert, toast)
  | "compact";  // Mini state for dropdowns, drawers, table cells

export interface UIStateAction {
  label: string;
  onClick?: () => void | Promise<void>;
  href?: string;
  variant?: ButtonProps["variant"];
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  ariaLabel?: string;
  isExternal?: boolean;
}

export interface BaseStateProps {
  /** Main title for the state */
  title?: ReactNode;
  /** Explanatory description */
  description?: ReactNode;
  /** Visual indicator icon or graphic */
  icon?: ReactNode;
  /** Eyebrow or category tag above title */
  eyebrow?: string;
  /** Visual variant affecting accents, border tints, and icon colors */
  variant?: UIStateVariant;
  /** Layout style and container constraints */
  layout?: UIStateLayout;
  /** Primary action button/link */
  primaryAction?: UIStateAction;
  /** Secondary action button/link */
  secondaryAction?: UIStateAction;
  /** Additional custom actions or action elements */
  actions?: ReactNode;
  /** Custom children rendered inside the state container */
  children?: ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Custom inline style overrides */
  style?: React.CSSProperties;
  /** ARIA live announcement mode ('polite' | 'assertive' | 'off') */
  ariaLive?: "polite" | "assertive" | "off";
  /** ARIA role override ('status' | 'alert' | 'region' etc.) */
  role?: "status" | "alert" | "region" | "dialog" | "banner";
  /** Unique ID for accessibility labelling */
  id?: string;
}

export interface StateSkeletonProps {
  /** Skeleton shape variant */
  variant?: "text" | "circular" | "rectangular" | "card";
  /** Width override (e.g. '100%', '200px', '4rem') */
  width?: string | number;
  /** Height override (e.g. '1.5rem', '40px', '200px') */
  height?: string | number;
  /** Border radius override */
  borderRadius?: string;
  /** Additional CSS class names */
  className?: string;
  /** Custom inline style overrides */
  style?: React.CSSProperties;
  /** Number of repeated skeleton items */
  count?: number;
}
