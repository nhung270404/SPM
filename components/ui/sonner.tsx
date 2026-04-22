"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      {...props}
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      unstyled={true}
      toastOptions={{
        classNames: {
          toast: "premium-toast group",
          title: "premium-toast-title",
          description: "premium-toast-description",
          actionButton: "bg-primary text-primary-foreground font-bold rounded-lg px-3 py-1.5 text-xs transition-opacity hover:opacity-90",
          cancelButton: "bg-muted text-muted-foreground font-bold rounded-lg px-3 py-1.5 text-xs transition-opacity hover:opacity-90",
        },
      }}
      position="top-center"
    />
  )
}

export { Toaster }
