import RecentPosts from '@/app/components/RecentPosts'
import Services from '@/app/components/Services'
import Works from '@/app/components/Works'
import { client } from '@/app/sanity/client'
import { worksQuery, servicesQuery } from '@/app/sanity/queries'
import AnimateOnScroll from '@/app/components/AnimateOnScroll'
import Image from 'next/image'

export default async function HomePage() {
  const companyName = "STUDIO WORKS"
  const letters = companyName.split('')

  // Worksデータをサーバーサイドでフェッチ
  const works = await client.fetch(worksQuery)
  // Servicesデータをサーバーサイドでフェッチ
  const services = await client.fetch(servicesQuery)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center bg-hero-pattern bg-cover bg-center overflow-hidden">
        {/* Overlay */}
        <div className="absolute inset-0 bg-gray-800 opacity-70"></div>
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Large, slow-spinning circle */}
          <div className="absolute w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-screen animate-spin-slow top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 opacity-30"></div>
          {/* Medium, pulsing square */}
          <div className="absolute w-[400px] h-[400px] bg-purple-500 mix-blend-overlay animate-pulse-slow bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 opacity-30"></div>
          {/* Smaller, faster-spinning circle */}
          <div className="absolute w-[300px] h-[300px] bg-red-500 rounded-full mix-blend-multiply animate-spin-slow animation-delay-200 top-1/3 right-1/3 opacity-30"></div>
          {/* Irregular shape (using rotation and skew) */}
          <div className="absolute w-[450px] h-[450px] bg-green-500 mix-blend-lighten animate-spin-slow animation-delay-400 bottom-1/3 left-1/3 transform rotate-45 skew-x-12 opacity-30"></div>
          
        </div>

        <div className="relative z-10 container mx-auto px-4 max-w-5xl flex items-center justify-between">
          {/* Text Content */}
          <div className="w-full">
            <h1 className="text-8xl font-extrabold mb-4 text-left leading-tight flex flex-wrap">
              {letters.map((letter, index) => (
                <span
                  key={index}
                  className="inline-block opacity-0 animate-staggered-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {letter === ' ' ? '\u00A0' : letter} {/* Handle space character */}
                </span>
              ))}
            </h1>
            <p className="text-3xl text-gray-300 animate-fade-in-up animation-delay-200 text-left max-w-xl ml-2">
              Web Design & Development for the Future
            </p>
          </div>

          {/* Image Content (Removed) */}
        </div>
      </section>

      {/* About Section */}
      <section className="relative py-20 bg-new-about-pattern bg-cover bg-center text-white overflow-hidden">
        {/* Overlay */}
        <div className="absolute inset-0 bg-gray-800 opacity-70"></div>
        {/* Abstract Background Elements for About Section */}
        <div className="absolute inset-0 flex items-center justify-center">
          
        </div>

        <div className="relative z-10 container mx-auto px-4 max-w-5xl">
          <AnimateOnScroll>
            <h2 className="text-4xl font-bold text-center mb-12">About Us</h2>
            <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              STUDIO WORKSは、ノーコードWebデザインツール「Studio」を専門とするWebサイト制作会社です。
              私たちは、お客様のビジネス目標達成に貢献するため、デザインと機能性を両立させた高品質なWebサイトを提供しています。
              Studioの持つ無限の可能性を最大限に引き出し、お客様のブランドイメージを深く理解し、ターゲットユーザーに響くデザインと機能性を追求します。
              企画段階からデザイン、構築、運用、そしてその後の改善提案まで、一貫したサポート体制でお客様のWeb戦略を強力に推進します。
              ノーコードでのWebサイト制作にご興味のある方、現在のWebサイトに課題を感じている方は、ぜひ一度STUDIO WORKSにご相談ください。
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Services Section */}
      <section className="relative py-20 bg-services-pattern bg-cover bg-center text-white overflow-hidden">
        {/* Abstract Background Elements for Services Section */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-15"></div>
          {/* Small, fast-spinning square */}
          <div className="absolute w-48 h-48 bg-yellow-400 mix-blend-screen animate-spin-slow animation-delay-500 top-1/4 right-1/4 transform rotate-15 opacity-25"></div>
          {/* Large, slow-pulsing circle */}
          <div className="absolute w-96 h-96 bg-pink-500 rounded-full mix-blend-overlay animate-pulse-slow animation-delay-200 bottom-1/3 left-1/3 opacity-25"></div>
          {/* New: Distorted Hexagon */}
          <div className="absolute w-60 h-60 bg-lime-400 mix-blend-lighten animate-spin-slow animation-delay-700 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-60 opacity-20" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 max-w-5xl">
          <AnimateOnScroll>
            <h2 className="text-4xl font-bold text-center mb-12">Our Services</h2>
            <Services services={services} />
          </AnimateOnScroll>
        </div>
      </section>

      {/* Works Section */}
      <section className="relative py-20 bg-works-pattern bg-cover bg-center text-white overflow-hidden">
        {/* Abstract Background Elements for Works Section */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Distorted Rectangle */}
          <div className="absolute w-[600px] h-[400px] bg-orange-500 mix-blend-lighten animate-spin-slow animation-delay-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-12 skew-y-6 opacity-20"></div>
          {/* Small, fast-pulsing circle */}
          <div className="absolute w-64 h-64 bg-teal-500 rounded-full mix-blend-screen animate-pulse-slow animation-delay-300 bottom-1/4 left-1/4 opacity-25"></div>
          {/* New: Large, slow-moving square */}
          <div className="absolute w-[500px] h-[500px] bg-fuchsia-500 mix-blend-overlay animate-pulse-slow animation-delay-600 top-1/4 right-1/4 transform rotate-45 opacity-20"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 max-w-5xl">
          <AnimateOnScroll>
            <h2 className="text-4xl font-bold text-center mb-12">Our Works</h2>
            <Works works={works} /> {/* worksデータをpropsとして渡す */}
          </AnimateOnScroll>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="relative py-20 bg-recent-posts-pattern bg-cover bg-center text-white overflow-hidden">
        {/* Abstract Background Elements for Recent Posts Section */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Flowing Lines (using linear gradient) */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-flow-lines opacity-15"></div>
          {/* Small, rotating square */}
          <div className="absolute w-60 h-60 bg-indigo-500 mix-blend-overlay animate-spin-slow animation-delay-200 top-1/3 left-1/3 transform rotate-45 opacity-20"></div>
          {/* New: Pulsing circle */}
          <div className="absolute w-48 h-48 bg-purple-400 rounded-full mix-blend-screen animate-pulse-slow animation-delay-400 bottom-1/2 right-1/2 opacity-20"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 max-w-5xl">
          <AnimateOnScroll>
            <h2 className="text-4xl font-bold text-center mb-12">Recent Posts</h2>
            <RecentPosts />
          </AnimateOnScroll>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative py-20 bg-get-in-touch-pattern bg-cover bg-center text-white overflow-hidden">
        {/* Overlay */}
        <div className="absolute inset-0 bg-gray-800 opacity-80"></div>
        {/* Abstract Background Elements for Contact Section */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Concentric Circles */}
          <div className="absolute w-96 h-96 border-4 border-blue-500 rounded-full animate-pulse-slow opacity-20"></div>
          <div className="absolute w-72 h-72 border-4 border-purple-500 rounded-full animate-pulse-slow animation-delay-100 opacity-20"></div>
          {/* Small, fast-moving dot */}
          <div className="absolute w-6 h-6 bg-red-500 rounded-full animate-ping-fast opacity-60"></div>
          
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center max-w-5xl">
          <AnimateOnScroll>
            <h2 className="text-4xl font-bold mb-8">Get in Touch</h2>
            <p className="text-lg text-gray-300 mb-8 animate-fade-in-up animation-delay-200">
              ご質問やご相談がありましたら、お気軽にお問い合わせください。
            </p>
            <a href="/contact" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 animate-fade-in-up animation-delay-400">
              Contact Us
            </a>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  )
}