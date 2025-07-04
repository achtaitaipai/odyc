import { getCollection } from 'astro:content'
import { defaultLocale, getLocaleByPath, type Locale } from './i18n'

export function getDocStaticPaths(locale: Locale) {
	return async () => {
		const posts = (await getCollection('docs')).filter(
			(el) => getLocaleByPath(el.id) === locale,
		)
		return posts.map((post) => {
			let slug = post.id
				.replace(/\d+-/g, '') // Remove "1--", "2--", etc.
				.replace(/\.md$/, '') // Remove .md extension
			if (locale !== defaultLocale) slug = slug.replace(locale + '/', '')
			return {
				params: { slug },
				props: { post },
			}
		})
	}
}
