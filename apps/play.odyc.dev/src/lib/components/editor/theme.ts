import { EditorView } from '@codemirror/view';
import type { Extension } from '@codemirror/state';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

export const oneDarkTheme = EditorView.theme(
	{
		'&': {
			color: 'var(--code-color-text-primary)',
			backgroundColor: 'var(--code-color-background)'
		},

		'.cm-content': {
			caretColor: 'var(--code-color-cursor)'
		},

		'.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--code-color-cursor)' },
		'&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
			{ backgroundColor: 'var(--code-color-selection)' },

		'.cm-panels': {
			backgroundColor: 'var(--code-color-dark-background)',
			color: 'var(--code-color-text-primary)'
		},
		'.cm-panels.cm-panels-top': { borderBottom: '2px solid black' },
		'.cm-panels.cm-panels-bottom': { borderTop: '2px solid black' },

		'.cm-searchMatch': {
			backgroundColor: '#72a1ff59',
			outline: '1px solid #457dff'
		},
		'.cm-searchMatch.cm-searchMatch-selected': {
			backgroundColor: '#6199ff2f'
		},

		'.cm-activeLine': { backgroundColor: '#6699ff0b' },
		'.cm-selectionMatch': { backgroundColor: '#aafe661a' },

		'&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket': {
			backgroundColor: '#bad0f847'
		},

		'.cm-gutters': {
			backgroundColor: 'var(--code-color-background)',
			color: 'var(--code-color-text-secondary)',
			border: 'none'
		},

		'.cm-activeLineGutter': {
			backgroundColor: 'var(--code-color-highlight-background)'
		},

		'.cm-foldPlaceholder': {
			backgroundColor: 'transparent',
			border: 'none',
			color: '#ddd'
		},

		'.cm-tooltip': {
			border: 'none',
			backgroundColor: 'var(--code-color-tooltip-background)'
		},
		'.cm-tooltip .cm-tooltip-arrow:before': {
			borderTopColor: 'transparent',
			borderBottomColor: 'transparent'
		},
		'.cm-tooltip .cm-tooltip-arrow:after': {
			borderTopColor: 'var(--code-color-tooltip-background)',
			borderBottomColor: 'var(--code-color-tooltip-background)'
		},
		'.cm-tooltip-autocomplete': {
			'& > ul > li[aria-selected]': {
				backgroundColor: 'var(--code-color-highlight-background)',
				color: 'var(--code-color-text-primary)'
			}
		},
		'.cm-panels .cm-button': {
			backgroundImage: 'inherit',
			cursor: 'pointer',
			color: 'var(--code-color-text-primary)'
		},
		'.cm-panels .cm-button:hover': {
			backgroundColor: 'var(--code-color-button-hover-background)'
		}
	},
	{ dark: true }
);

/// The highlighting style for code in the One Dark theme.
export const oneDarkHighlightStyle = HighlightStyle.define([
	{ tag: t.keyword, color: 'var(--code-color-syntax-keyword)' },
	{
		tag: [t.deleted, t.character, t.propertyName, t.macroName],
		color: 'var(--code-color-syntax-identifier)'
	},
	{ tag: [t.function(t.variableName), t.labelName], color: 'var(--code-color-syntax-function)' },
	{
		tag: [t.color, t.constant(t.name), t.standard(t.name)],
		color: 'var(--code-color-syntax-constant)'
	},
	{ tag: [t.separator], color: 'var(--code-color-text-primary)' },
	{ tag: [t.name, t.definition(t.name)], color: 'var(--code-color-syntax-name)' },
	{
		tag: [
			t.typeName,
			t.className,
			t.number,
			t.changed,
			t.annotation,
			t.modifier,
			t.self,
			t.namespace
		],
		color: 'var(--code-color-syntax-constant)'
	},
	{
		tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link],
		color: 'var(--code-color-syntax-operator)'
	},
	{ tag: [t.meta, t.comment], color: 'var(--code-color-text-secondary)' },
	{ tag: t.strong, fontWeight: 'bold' },
	{ tag: t.emphasis, fontStyle: 'italic' },
	{ tag: t.strikethrough, textDecoration: 'line-through' },
	{ tag: t.link, color: 'var(--code-color-text-secondary)', textDecoration: 'underline' },
	{ tag: t.heading, fontWeight: 'bold', color: 'var(--code-color-syntax-identifier)' },
	{ tag: [t.atom, t.bool, t.special(t.variableName)], color: 'var(--code-color-syntax-constant)' },
	{
		tag: [t.processingInstruction, t.string, t.inserted],
		color: 'var(--code-color-syntax-string)'
	},
	{ tag: t.invalid, color: 'var(--code-color-syntax-invalid)' }
]);

/// Extension to enable the One Dark theme (both the editor theme and
/// the highlight style).
export const theme: Extension = [oneDarkTheme, syntaxHighlighting(oneDarkHighlightStyle)];
