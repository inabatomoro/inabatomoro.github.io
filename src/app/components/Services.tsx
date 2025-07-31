'use client'

import Link from 'next/link'
import Image from 'next/image'
import { client } from '@/app/sanity/client'
import { useState } from 'react'
import imageUrlBuilder from '@sanity/image-url'

const builder = imageUrlBuilder(client)

function urlFor(source: any) {
  return builder.image(source)
}

interface ServicesProps {
  services: any[]; // Data passed from parent page.tsx
}

export default function Services({ services }: ServicesProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  // Ensure services array is not empty
  if (!services || services.length === 0) {
    return <div className="text-white text-center text-2xl py-20">No Services available.</div>
  }

  const numServices = services.length

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % numServices)
  }

  const handlePrev = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + numServices) % numServices)
  }

  return (
    <div className="relative w-full min-h-[600px] flex justify-center overflow-hidden py-16"> {/* Removed items-center */}
      {services.map((service, index) => {
        const offset = (index - activeIndex + numServices) % numServices
        let transformStyle = ''
        let zIndex = 10
        let opacity = 0
        let pointerEvents: 'none' | 'auto' = 'none'
        let cardWidth = '350px'
        let cardHeight = 'auto' // Auto height
        let imageHeight = 'h-72' // Default image height for side cards

        if (offset === 0) { // Active (center) card
          transformStyle = 'translateX(-50%) scale(1.1)'
          zIndex = 30
          opacity = 1
          pointerEvents = 'auto'
          cardWidth = '400px' // Slightly wider for center
          imageHeight = 'h-80' // Taller image for center
        } else if (offset === 1) { // Next card (right)
          transformStyle = 'translateX(calc(-50% + 280px)) scale(0.9)' // Adjusted translateX for more space
          zIndex = 20
          opacity = 1
          pointerEvents = 'auto'
        } else if (offset === numServices - 1) { // Previous card (left)
          transformStyle = 'translateX(calc(-50% - 280px)) scale(0.9)' // Adjusted translateX for more space
          zIndex = 20
          opacity = 1
          pointerEvents = 'auto'
        } else { // Other cards (hidden)
          transformStyle = 'translateX(-50%) scale(0.8)'
          zIndex = 5
          opacity = 0
          pointerEvents = 'none'
        }

        return (
          <Link
            href={`/service/${service.slug.current}`}
            key={service._id}
            className="absolute block bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-500 ease-in-out text-black"
            style={{
              left: '50%',
              top: '100px', // Adjusted top position to be below the title
              width: cardWidth,
              height: cardHeight, // Auto height
              transform: transformStyle,
              zIndex: zIndex,
              opacity: opacity,
              pointerEvents: pointerEvents,
            }}
          >
            {(service.mainImage || service.imageUrl) && (
              <div className={`relative w-full ${imageHeight}`}> {/* Dynamic image height */}
                <Image
                  src={service.imageUrl || urlFor(service.mainImage).url()}
                  alt={service.mainImage?.alt || service.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-black mb-2">{service.title}</h3>
              <p className="text-gray-700">{service.description}</p>
            </div>
          </Link>
        )
      })}

      {/* Navigation Buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white p-3 rounded-full z-30 hover:bg-gray-600 transition"
      >
        &lt;
      </button>
      <button
        onClick={handleNext}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white p-3 rounded-full z-30 hover:bg-gray-600 transition"
      >
        &gt;
      </button>
    </div>
  )
}
