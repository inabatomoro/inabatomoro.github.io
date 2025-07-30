import { client } from '@/app/sanity/client'
import { postsQuery } from '@/app/sanity/queries'
import PostList from '@/app/components/PostList'
import BlogSidebar from '@/app/components/BlogSidebar'

export default async function BlogPage() {
  const posts = await client.fetch(postsQuery)

  return (
    <div className="bg-gradient-to-b from-gray-100 to-white text-black min-h-screen">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-black">Blog</h1>
      </div>
      <div className="flex flex-col lg:flex-row">
        {/* Main Content Area */}
        <div className="lg:w-3/4 py-8">
          <div className="container mx-auto max-w-5xl px-4">
            <PostList posts={posts} />
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="lg:w-1/4 bg-white py-8 px-4">
          <BlogSidebar />
        </div>
      </div>
    </div>
  )
}
