import { translations } from './ui'

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

export function useTranslatePath(locale: Locale) {
	return (path: string) => {
		const pathLocale = getLocaleByPath(path) as Locale
		return locale === defaultLocale ? path : `/${locale}${path}`
	}
}

export function translatePath(locale: Locale, path: string) {
	const pathLocale = getLocaleByPath(path) as Locale
	if (pathLocale === locale) return path
	const prefix = locale === defaultLocale ? '' : locale
	if (pathLocale === defaultLocale) return '/' + prefix + path
	return path.replace(pathLocale, prefix).replace(/\/+/g, '/')
}

export function getLocaleByPath(path: string): Locale {
	if (!path.startsWith('/')) path = '/' + path
	const [, lang] = path.split('/')
	//@ts-ignore
	if (locales.includes(lang)) return lang as Locale
	return defaultLocale
}
