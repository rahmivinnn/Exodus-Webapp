"use client"

import React from 'react'

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function ExodusLogo({ className = "", width = 180, height = 40 }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center space-x-2">
        {/* Logo Icon */}
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-teal-500 to-green-600 rounded-lg">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            className="text-white"
          >
            <path 
              d="M3 7L12 2L21 7V17L12 22L3 17V7Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M12 2V22" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"
            />
            <path 
              d="M3 7L12 12L21 7" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        
        {/* Logo Text */}
        <div className="flex flex-col">
          <span className="text-xl font-bold text-gray-900 leading-tight">
            EXODUS
          </span>
          <span className="text-sm font-medium text-teal-600 leading-tight -mt-1">
            LOGISTIX
          </span>
        </div>
      </div>
    </div>
  )
}

export function ExodusLogoSimple({ className = "", width = 120, height = 32 }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center space-x-2">
        {/* Simple Logo Icon */}
        <div className="flex items-center justify-center w-8 h-8 bg-teal-600 rounded-md">
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            className="text-white"
          >
            <path 
              d="M3 7L12 2L21 7V17L12 22L3 17V7Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M12 2V22" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"
            />
          </svg>
        </div>
        
        {/* Logo Text */}
        <div className="flex flex-col">
          <span className="text-lg font-bold text-gray-900 leading-tight">
            EXODUS
          </span>
          <span className="text-xs font-medium text-teal-600 leading-tight -mt-1">
            LOGISTIX
          </span>
        </div>
      </div>
    </div>
  )
}