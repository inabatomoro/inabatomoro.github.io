export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white p-8 text-center border-t border-gray-700">
      <div className="container mx-auto max-w-5xl">
        <p>&copy; {new Date().getFullYear()} STUDIO WORKS. All rights reserved.</p>
      </div>
    </footer>
  )
}