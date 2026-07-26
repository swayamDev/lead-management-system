"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

/**
 * Thin wrapper so toasts pick up the app's existing design tokens
 * instead of sonner's defaults. No next-themes dependency - this
 * project doesn't have a theme switcher, so we just point sonner at
 * the CSS variables already defined in globals.css.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
