import { defineCollection, z } from 'astro:content'

const docsCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		category: z.string(),
		locale: z.string().optional(),
	}),
})

export const collections = {
	docs: docsCollection,
}
