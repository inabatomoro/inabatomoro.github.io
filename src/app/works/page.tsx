import { client } from '@/app/sanity/client'
import { worksQuery } from '@/app/sanity/queries'
import Link from 'next/link'
import Image from 'next/image'
import imageUrlBuilder from '@sanity/image-url'

const builder = imageUrlBuilder(client)

function urlFor(source: any) {
  return builder.image(source)
}

export default async function WorksPage() {
  const works = await client.fetch(worksQuery)

  return (
    <div className="bg-gradient-to-b from-gray-100 to-white text-black min-h-screen">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-black">Works</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {works.map((work: any) => (
            <Link href={`/works/${work.slug.current}`} key={work._id} className="block bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 text-black">
              {(work.mainImage || work.imageUrl) && (
                <div className="relative w-full h-48">
                  <Image
                    src={work.imageUrl || urlFor(work.mainImage).url()}
                    alt={work.mainImage?.alt || work.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-black mb-2">{work.title}</h2>
                <p className="text-gray-700">{work.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
