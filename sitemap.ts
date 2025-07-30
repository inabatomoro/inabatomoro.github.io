import { MetadataRoute } from 'next'
import { client } from './src/app/sanity/client'

interface Post {
  _id: string;
  slug: { current: string };
  publishedAt: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await client.fetch<Post[]>(
    `*[_type == "post"] | order(publishedAt desc) {
      _id,
      slug,
      publishedAt
    }`
  );

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `https://your-domain.com/blog/${post.slug.current}`,
    lastModified: post.publishedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    {
      url: 'https://your-domain.com',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: 'https://your-domain.com/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...postEntries,
  ]
}
