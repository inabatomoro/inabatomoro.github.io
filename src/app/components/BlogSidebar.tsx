import Link from 'next/link'

export default function BlogSidebar() {
  return (
    <aside className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-black border-b border-gray-300 pb-3">Categories</h2>
      <ul className="space-y-3 mb-8">
        <li><Link href="/blog?category=nocode" className="text-blue-600 hover:underline block py-1">ノーコード</Link></li>
        <li><Link href="/blog?category=webdesign" className="text-blue-600 hover:underline block py-1">Webデザイン</Link></li>
        <li><Link href="/blog?category=studio" className="text-blue-600 hover:underline block py-1">Studio</Link></li>
      </ul>

      <h2 className="text-2xl font-bold mb-6 text-black border-b border-gray-300 pb-3">Recent Posts</h2>
      <ul className="space-y-3">
        <li><Link href="/blog/dummy-post-2" className="text-blue-600 hover:underline block py-1">ダミー記事2</Link></li>
        <li><Link href="/blog/dummy-post-3" className="text-blue-600 hover:underline block py-1">ダミー記事3</Link></li>
        <li><Link href="/blog/dummy-post-4" className="text-blue-600 hover:underline block py-1">ダミー記事4</Link></li>
      </ul>
    </aside>
  )
}