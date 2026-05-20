"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:border-border group-[.toaster]:shadow-lg flex items-center gap-2 data-[type=success]:border-emerald-500/20 data-[type=error]:border-destructive/20 data-[type=warning]:border-amber-500/20 data-[type=info]:border-blue-500/20",
          title: "text-foreground font-medium group-data-[type=success]:text-emerald-600! group-data-[type=success]:dark:text-emerald-400! group-data-[type=error]:text-destructive! group-data-[type=warning]:text-amber-600! group-data-[type=info]:text-blue-600!",
          icon: "group-data-[type=success]:text-emerald-600! group-data-[type=success]:dark:text-emerald-400! group-data-[type=error]:text-destructive! group-data-[type=warning]:text-amber-600! group-data-[type=info]:text-blue-600!",
          closeButton: "group-data-[type=success]:text-emerald-600! group-data-[type=error]:text-destructive! group-data-[type=warning]:text-amber-600! group-data-[type=info]:text-blue-600! hover:bg-background! hover:border-border! hover:scale-100! transition-none cursor-pointer",
          description: "group-[.toast]:text-muted-foreground group-data-[type=success]:text-emerald-600/80! group-data-[type=error]:text-destructive/80!",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
