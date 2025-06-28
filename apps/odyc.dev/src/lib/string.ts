import makeSlug from 'slugify'

export function slugify(text: string) {
	return makeSlug(text, { lower: true })
}
