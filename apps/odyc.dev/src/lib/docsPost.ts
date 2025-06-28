import type { CollectionEntry } from 'astro:content'
import { getLocaleByPath, pathHasLocale } from 'astro:i18n'
import { defaultLocale } from './i18n'

export function getDocPostLocale(post: CollectionEntry<'docs'>) {
	if (pathHasLocale(post.id)) return getLocaleByPath(post.id)
	return defaultLocale
}
