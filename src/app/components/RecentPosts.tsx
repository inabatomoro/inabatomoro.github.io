import Link from 'next/link'
import Image from 'next/image'
import { client } from '@/app/sanity/client'
import { postsQuery } from '@/app/sanity/queries'

export default async function RecentPosts() {
  const posts = await client.fetch(postsQuery)

  // 無限ループのために記事アイテムを複製
  const duplicatedPosts = [...posts, ...posts, ...posts, ...posts, ...posts, ...posts, ...posts, ...posts, ...posts, ...posts] // 10回複製して十分な量にする

  return (
    <div className="relative w-full overflow-hidden py-8">
      <div className="flex animate-infinite-scroll-fast group-hover:pause">
        {duplicatedPosts.map((post: any, index: number) => (
          <Link
            href={`/blog/${post.slug.current}`}
            key={`${post._id}-${index}`}
            className="flex-shrink-0 w-80 bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl text-black mx-4"
          >
            {(post.mainImage || post.imageUrl) && (
              <div className="relative w-full h-48">
                <Image
                  src={post.imageUrl || client.urlFor(post.mainImage).url()}
                  alt={post.mainImage?.alt || post.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-black mb-2">{post.title}</h3>
              <p className="text-gray-700 text-sm">{new Date(post.publishedAt).toLocaleDateString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}