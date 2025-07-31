'use client'

import React, { useState, useRef, useEffect } from 'react'
import { PortableText } from '@portabletext/react'

interface SummaryButtonProps {
  summary: any; // summaryの型をanyに戻す
}

export default function SummaryButton({ summary }: SummaryButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const toggleAccordion = () => {
    setIsOpen(!isOpen)
  }

  // summaryがない場合はボタンを表示しない
  if (!summary) {
    return null
  }

  return (
    <div className="mb-8">
      <button
        onClick={toggleAccordion}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 flex items-center justify-between w-full"
      >
        <span>この記事の要約をみる</span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      <div
        ref={contentRef}
        style={{
          maxHeight: isOpen ? `${contentRef.current?.scrollHeight}px` : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-in-out',
        }}
        className="mt-4"
      >
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg prose max-w-none prose-invert">
          <PortableText value={summary} />
        </div>
      </div>
    </div>
  )
}
