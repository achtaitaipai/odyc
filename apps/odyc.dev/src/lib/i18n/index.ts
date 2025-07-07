import { translations } from './ui'
import type { AstroConfig } from 'astro'

export type Locale = (typeof locales)[number]

export const locales = ['fr', 'en'] as const
export const defaultLocale: Locale = 'en'

export const languages: Record<Locale, string> = {
	en: 'English',
	fr: 'Français',
}

export function useTranslations(lang: Locale) {
	return function t(key: keyof (typeof translations)[typeof defaultLocale]) {
		return translations[lang][key] || translations[defaultLocale][key]
	}
}

export function getLocaleByPath(path: string): Locale {
	if (!path.startsWith('/')) path = '/' + path
	const [, lang] = path.split('/')
	//@ts-ignore
	if (locales.includes(lang)) return lang as Locale
	return defaultLocale
}

/**
 * Get the equivalent of the passed URL for the passed locale.
 */
export function localizedUrl(url: URL, locale: string | undefined): URL {
	url = new URL(url)
	if (locale === defaultLocale) locale = ''

	const [_leadingSlash, baseSegment] = url.pathname.split('/')
	const htmlExt = '.html'
	const isRootHtml = baseSegment?.endsWith(htmlExt)
	const baseSlug = isRootHtml
		? baseSegment?.slice(0, -1 * htmlExt.length)
		: baseSegment
	if (baseSlug && locales.includes(baseSlug as Locale)) {
		if (locale) {
			url.pathname = url.pathname.replace(baseSlug, locale)
		} else if (isRootHtml) {
			url.pathname = '/index.html'
		} else {
			url.pathname = url.pathname.replace('/' + baseSlug, '')
		}
	} else if (locale) {
		if (baseSegment === 'index.html') {
			url.pathname = '/' + locale + '.html'
		} else {
			url.pathname = '/' + locale + url.pathname
		}
	}
	return url
}
