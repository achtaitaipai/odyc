import pkg from 'js-beautify';

export function formatJs(code: string) {
	return pkg.js_beautify(code, {
		indent_size: 2,
		// indent_with_tabs: true,
		space_in_empty_paren: true,
		preserve_newlines: true,
		max_preserve_newlines: 2
	});
}
