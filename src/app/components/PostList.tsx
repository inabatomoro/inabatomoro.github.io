import Link from 'next/link'
import Image from 'next/image'
import { client } from '@/app/sanity/client'
import imageUrlBuilder from '@sanity/image-url'

const builder = imageUrlBuilder(client)

function urlFor(source: any) {
  return builder.image(source)
}

interface Post {
  _id: string
  title: string
  slug: { current: string }
  mainImage: any
  imageUrl?: string
  publishedAt: string
  categories: string[]
  author: string
}

interface PostListProps {
  posts: Post[]
}

export default function PostList({ posts }: PostListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <Link href={`/blog/${post.slug.current}`} key={post._id} className="block bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 text-black">
          {(post.mainImage || post.imageUrl) && (
            <div className="relative w-full h-48">
              <Image
                src={post.imageUrl || urlFor(post.mainImage).url()}
                alt={post.mainImage?.alt || post.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-black mb-2">{post.title}</h2>
            <p className="text-gray-600 text-sm mb-4">{new Date(post.publishedAt).toLocaleDateString()}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories && post.categories.map((category) => (
                <span key={category} className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                  {category}
                </span>
              ))}
            </div>
            <p className="text-gray-700">By {post.author}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}