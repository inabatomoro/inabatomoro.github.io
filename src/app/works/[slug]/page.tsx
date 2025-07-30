import { client } from '@/app/sanity/client'
import { workQuery, workSlugsQuery } from '@/app/sanity/queries'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'

export async function generateStaticParams() {
  const slugs = await client.fetch(workSlugsQuery)
  return slugs.map((slug: string) => ({ slug }))
}

export default async function WorkPage({ params }: { params: { slug: string } }) {
  const work = await client.fetch(workQuery, { slug: params.slug })

  if (!work) {
    return <div>Work not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 text-white max-w-5xl">
      <h1 className="text-5xl font-bold mb-4">{work.title}</h1>
      {work.client && <p className="text-gray-400 mb-2">Client: {work.client}</p>}
      {work.url && <p className="text-gray-400 mb-6">URL: <a href={work.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{work.url}</a></p>}
      {work.mainImage || work.imageUrl && (
        <div className="relative w-full h-96 mb-8">
          <Image
            src={work.imageUrl || client.urlFor(work.mainImage).url()}
            alt={work.mainImage?.alt || work.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      )}
      <div className="prose prose-invert max-w-none">
        <PortableText value={work.body} />
      </div>
    </div>
  )
}
