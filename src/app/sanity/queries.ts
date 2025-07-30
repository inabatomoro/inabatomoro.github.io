import { groq } from 'next-sanity'

export const postsQuery = groq`
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    mainImage,
    imageUrl,
    publishedAt,
    "categories": categories[]->title,
    "author": author->name,
  }
`

export const postQuery = groq`
  *[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    mainImage,
    imageUrl,
    publishedAt,
    _updatedAt,
    body,
    summary,
    "categories": categories[]->title,
    "author": author->name,
  }
`

export const postSlugsQuery = groq`
  *[_type == "post" && defined(slug.current)][].slug.current
`

export const servicesQuery = groq`
  *[_type == "service"] | order(title asc) {
    _id,
    title,
    slug,
    description,
    mainImage,
    imageUrl,
  }
`

export const serviceQuery = groq`
  *[_type == "service" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    description,
    mainImage,
    imageUrl,
    body,
  }
`

export const serviceSlugsQuery = groq`
  *[_type == "service" && defined(slug.current)][].slug.current
`

export const worksQuery = groq`
  *[_type == "work"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    description,
    mainImage,
    imageUrl,
    client,
    url,
  }
`

export const workQuery = groq`
  *[_type == "work" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    description,
    mainImage,
    imageUrl,
    client,
    url,
    body,
  }
`

export const workSlugsQuery = groq`
  *[_type == "work" && defined(slug.current)][].slug.current
`
