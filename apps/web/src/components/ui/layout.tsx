import * as React from "react"
import { cn } from "@/lib/utils"

interface LayoutProps {
  children: React.ReactNode
  className?: string
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <main className="flex min-h-screen flex-col">
        {children}
      </main>
    </div>
  )
}

interface LayoutHeaderProps {
  children: React.ReactNode
  className?: string
}

export function LayoutHeader({ children, className }: LayoutHeaderProps) {
  return (
    <header className={cn("border-b", className)}>
      <div className="container flex h-14 items-center">
        {children}
      </div>
    </header>
  )
}

interface LayoutContentProps {
  children: React.ReactNode
  className?: string
}

export function LayoutContent({ children, className }: LayoutContentProps) {
  return (
    <div className={cn("container flex-1 py-6", className)}>
      {children}
    </div>
  )
} 