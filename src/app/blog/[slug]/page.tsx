import { client } from '@/app/sanity/client'
import { postQuery, postSlugsQuery } from '@/app/sanity/queries'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import BlogSidebar from '@/app/components/BlogSidebar'
import SummaryButton from '@/app/components/SummaryButton'

export async function generateStaticParams() {
  const slugs = await client.fetch(postSlugsQuery)
  return slugs.map((slug: string) => ({ slug }))
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await client.fetch(postQuery, { slug: params.slug })

  if (!post) {
    return <div>Post not found</div>
  }

  // 読了時間の計算 (簡易版: 1分あたり400文字として計算)
  const wordsPerMinute = 400 // 1分あたりの文字数（日本語の場合）
  const textContent = post.body.map((block: any) => {
    if (block._type === 'block') {
      return block.children.map((span: any) => span.text).join('')
    }
    return ''
  }).join('') // スペースではなく空文字で結合して文字数を正確にカウント
  const characterCount = textContent.length
  const readingTime = Math.ceil(characterCount / wordsPerMinute)

  // 日付のフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).format(date)
  }

  const publishedDate = formatDate(post.publishedAt)
  const updatedDate = formatDate(post._updatedAt)

  return (
    <div className="container mx-auto px-4 py-8 text-black max-w-2xl bg-white rounded-lg shadow-lg">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="lg:w-full">
          <h1 className="text-5xl font-bold mb-4">{post.title}</h1>
          <p className="text-gray-400 mb-2">
            公開日: {publishedDate}
            {post.publishedAt !== post._updatedAt && (
              <span className="ml-4">更新日: {updatedDate}</span>
            )}
          </p>
          <p className="text-gray-400 mb-6">この記事は **{readingTime}分** で読めます</p>

          <SummaryButton summary={post.summary} />

          {(post.mainImage || post.imageUrl) && (
            <div className="relative w-full h-96 mb-8">
              <Image
                src={post.imageUrl || client.urlFor(post.mainImage).url()}
                alt={post.mainImage?.alt || post.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          )}

          <div className="prose max-w-none">
            <PortableText value={post.body} />
          </div>
        </div>
      </div>
    </div>
  )
}
