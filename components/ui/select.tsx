import React from "react"

interface SelectProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
}

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
}

interface SelectContentProps {
  children: React.ReactNode
}

interface SelectItemProps {
  children: React.ReactNode
  value: string
}

interface SelectValueProps {
  placeholder?: string
}

export function Select({ children, value, onValueChange }: SelectProps) {
  return (
    <div className="relative">
      {children}
    </div>
  )
}

export function SelectTrigger({ children, className = "" }: SelectTriggerProps) {
  return (
    <button className={lex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 }>
      {children}
    </button>
  )
}

export function SelectValue({ placeholder }: SelectValueProps) {
  return <span className="text-gray-500">{placeholder}</span>
}

export function SelectContent({ children }: SelectContentProps) {
  return (
    <div className="absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white shadow-md">
      {children}
    </div>
  )
}

export function SelectItem({ children, value }: SelectItemProps) {
  return (
    <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100">
      {children}
    </div>
  )
}
