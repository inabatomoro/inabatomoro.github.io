'use client'

import React, { useRef, useEffect, useState } from 'react'

interface AnimateOnScrollProps {
  children: React.ReactNode;
  animationClass?: string; // 例: 'animate-fade-in-up'
  threshold?: number; // 0.0 から 1.0 の間で、要素のどのくらいが見えたらトリガーするか
  delay?: string; // animation-delay の値
}

export default function AnimateOnScroll({
  children,
  animationClass = 'animate-fade-in-up',
  threshold = 0.1,
  delay = '0s',
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target) // 一度表示されたら監視を停止
        }
      },
      {
        threshold: threshold,
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [threshold])

  return (
    <div
      ref={ref}
      className={`${isVisible ? animationClass : 'opacity-0'}`}
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  )
}
