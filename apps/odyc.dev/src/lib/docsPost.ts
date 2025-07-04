import { getCollection, type CollectionEntry } from 'astro:content'
import { defaultLocale, getLocaleByPath, type Locale } from './i18n'
import type { GetStaticPaths } from 'astro'
import { getAbsoluteLocaleUrl } from 'astro:i18n'

export function getDocStaticPaths(locale: Locale) {
	return (async () => {
		const posts = (await getCollection('docs')).filter(
			(el) => getLocaleByPath(el.id) === locale,
		)
		return posts.map((post) => {
			const slug = getDocsPostSlug(post, locale)
			return {
				params: { slug },
				props: { post },
			}
		})
	}) satisfies GetStaticPaths
}

export async function getDocsSummary(locale: Locale) {
	const summary: Record<
		string,
		{ title: string; url: string; slug: string }[]
	> = {}
	const posts = (await getCollection('docs')).filter(
		(el) => getLocaleByPath(el.id) === locale,
	)
	for (let i = 0; i < posts.length; i++) {
		const post = posts[i]
		const slug = getDocsPostSlug(post, locale)
		const url = getAbsoluteLocaleUrl(locale, `/docs/${slug}`)

		const category = post.data.category
		summary[category] = [
			...(summary[category] ?? []),
			{ title: post.data.title, url, slug },
		]
	}
	return Object.entries(summary)
}

export function getDocsPostSlug(post: CollectionEntry<'docs'>, locale: Locale) {
	let slug = post.id
		.replace(/\d+-/g, '') // Remove "1--", "2--", etc.
		.replace(/\.md$/, '') // Remove .md extension
	if (locale !== defaultLocale) slug = slug.replace(locale + '/', '')
	return slug
}
