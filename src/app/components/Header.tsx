import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-gray-900 text-white p-4 shadow-lg">
      <nav className="container mx-auto flex justify-between items-center max-w-5xl">
        <Link href="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition duration-300">
          STUDIO WORKS
        </Link>
        <ul className="flex space-x-6">
          <li>
            <Link href="/service" className="hover:text-blue-400 transition duration-300">
              Services
            </Link>
          </li>
          <li>
            <Link href="/works" className="hover:text-blue-400 transition duration-300">
              Works
            </Link>
          </li>
          <li>
            <Link href="/blog" className="hover:text-blue-400 transition duration-300">
              Blog
            </Link>
          </li>
          <li>
            <Link href="/community" className="hover:text-blue-400 transition duration-300">
              Community
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:text-blue-400 transition duration-300">
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}