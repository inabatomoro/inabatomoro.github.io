import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-05-03', // https://www.sanity.io/docs/api-versioning
  useCdn: true, // if you're using ISR or only static generation at build time then you can set this to `false` to ensure that you're always getting the freshest data
})