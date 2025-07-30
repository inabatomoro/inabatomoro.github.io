export default function ContactPage() {
  return (
    <div className="bg-gradient-to-b from-gray-100 to-white text-black min-h-screen">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-black">Contact Us</h1>
        <p className="text-lg mb-4 text-gray-800">ご質問やご相談がありましたら、お気軽にお問い合わせください。</p>
        <form className="bg-white p-8 rounded-lg shadow-lg">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-800 text-sm font-bold mb-2">お名前</label>
            <input type="text" id="name" name="name" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 border-gray-300" />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-800 text-sm font-bold mb-2">メールアドレス</label>
            <input type="email" id="email" name="email" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 border-gray-300" />
          </div>
          <div className="mb-6">
            <label htmlFor="message" className="block text-gray-800 text-sm font-bold mb-2">お問い合わせ内容</label>
            <textarea id="message" name="message" rows={5} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 border-gray-300"></textarea>
          </div>
          <div className="flex items-center justify-between">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              送信
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
