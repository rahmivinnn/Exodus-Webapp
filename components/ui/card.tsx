import React from "react"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div className={ounded-lg border bg-white shadow-sm } {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ className = "", children, ...props }: CardProps) {
  return (
    <div className={lex flex-col space-y-1.5 p-6 } {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className = "", children, ...props }: CardProps) {
  return (
    <h3 className={	ext-2xl font-semibold leading-none tracking-tight } {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ className = "", children, ...props }: CardProps) {
  return (
    <p className={	ext-sm text-gray-600 } {...props}>
      {children}
    </p>
  )
}

export function CardContent({ className = "", children, ...props }: CardProps) {
  return (
    <div className={p-6 pt-0 } {...props}>
      {children}
    </div>
  )
}
