import type { MarkdownHeading } from 'astro'

export interface TocEntry {
	slug: string
	text: string
	children?: TocEntry[]
}

export function getToc(headings: MarkdownHeading[]): TocEntry[] {
	if (headings.length === 0) return []

	function buildTocRecursive(
		headings: MarkdownHeading[],
		startIndex: number,
		parentDepth: number,
	): { entries: TocEntry[]; nextIndex: number } {
		const entries: TocEntry[] = []
		let i = startIndex

		while (i < headings.length) {
			const heading = headings[i]

			// If this heading is at a shallower level than our parent, we're done with this level
			if (heading.depth <= parentDepth) {
				break
			}

			// If this heading is at the expected next level
			if (heading.depth === parentDepth + 1) {
				const entry: TocEntry = {
					slug: heading.slug,
					text: heading.text,
				}

				// Recursively process children
				const childResult = buildTocRecursive(headings, i + 1, heading.depth)
				if (childResult.entries.length > 0) {
					entry.children = childResult.entries
				}

				entries.push(entry)
				i = childResult.nextIndex
			} else {
				// Skip headings that are too deep (missing intermediate levels)
				i++
			}
		}

		return { entries, nextIndex: i }
	}

	// Find the minimum depth to use as the base level
	const minDepth = Math.min(...headings.map((h) => h.depth))

	return buildTocRecursive(headings, 0, minDepth - 1).entries
}
