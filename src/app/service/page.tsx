import { client } from '@/app/sanity/client'
import { servicesQuery } from '@/app/sanity/queries'
import Link from 'next/link'
import Image from 'next/image'

export default async function ServicesPage() {
  const services = await client.fetch(servicesQuery)

  return (
    <div className="bg-gradient-to-b from-gray-100 to-white text-black min-h-screen">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-black">Services</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service: any) => (
            <Link href={`/service/${service.slug.current}`} key={service._id} className="block bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 text-black">
              {(service.mainImage || service.imageUrl) && (
                <div className="relative w-full h-48">
                  <Image
                    src={service.imageUrl || client.urlFor(service.mainImage).url()}
                    alt={service.mainImage?.alt || service.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-black mb-2">{service.title}</h2>
                <p className="text-gray-700">{service.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
