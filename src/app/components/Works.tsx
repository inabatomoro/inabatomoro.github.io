'use client'

import Link from 'next/link'
import Image from 'next/image'
import { client } from '@/app/sanity/client' // clientはurlForのために残す

interface WorksProps {
  works: any[];
}

export default function Works({ works }: WorksProps) {
  console.log("Works component rendering with props:", works)

  if (!works || works.length === 0) {
    return <div className="text-white text-center text-2xl py-20">No Works available.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {works.map((work: any, index: number) => (
        <Link
          href={`/works/${work.slug.current}`}
          key={work._id}
          className={`group block bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:rotate-1 hover:shadow-xl text-black
            ${index % 3 === 0 ? 'md:col-span-2' : ''} /* Every 3rd item spans 2 columns on medium screens */
            ${index % 5 === 0 ? 'lg:col-span-2 lg:row-span-2' : ''} /* Every 5th item spans 2x2 on large screens */
          `}
        >
          {(work.mainImage || work.imageUrl) && (
            <div className="relative w-full h-48 group-hover:scale-105 transition duration-300">
              <Image
                src={work.imageUrl || client.urlFor(work.mainImage).url()}
                alt={work.mainImage?.alt || work.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-black mb-2">{work.title}</h3>
            <p className="text-gray-700">{work.description}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
