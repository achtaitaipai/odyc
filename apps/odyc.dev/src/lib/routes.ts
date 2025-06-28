import type { CollectionEntry } from 'astro:content'
import { getLocaleByPath } from './i18n'
import { getRelativeLocaleUrl } from 'astro:i18n'
import { slugify } from './string'

export function getDocPostUrl(docPost: CollectionEntry<'docs'>) {
	const locale = getLocaleByPath(docPost.id)
	return getRelativeLocaleUrl(
		locale,
		[slugify(docPost.data.category), slugify(docPost.data.title)].join('/'),
	)
}
