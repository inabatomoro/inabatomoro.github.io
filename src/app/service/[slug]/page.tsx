import { client } from '@/app/sanity/client'
import { serviceQuery, serviceSlugsQuery } from '@/app/sanity/queries'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'

export async function generateStaticParams() {
  const slugs = await client.fetch(serviceSlugsQuery)
  return slugs.map((slug: string) => ({ slug }))
}

export default async function ServicePage({ params }: { params: { slug: string } }) {
  const service = await client.fetch(serviceQuery, { slug: params.slug })

  if (!service) {
    return <div>Service not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 text-white max-w-5xl">
      <h1 className="text-5xl font-bold mb-4">{service.title}</h1>
      {service.mainImage || service.imageUrl && (
        <div className="relative w-full h-96 mb-8">
          <Image
            src={service.imageUrl || client.urlFor(service.mainImage).url()}
            alt={service.mainImage?.alt || service.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      )}
      <div className="prose prose-invert max-w-none">
        <PortableText value={service.body} />
      </div>
    </div>
  )
}
