import { acceptCompletion, autocompletion } from '@codemirror/autocomplete';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { linter } from '@codemirror/lint';
import { Compartment, EditorState, type Extension } from '@codemirror/state';
import { EditorView, keymap, ViewUpdate } from '@codemirror/view';
import { vim } from '@replit/codemirror-vim';
import { basicSetup } from 'codemirror';
import { TsServer } from './TsServer';
import { formatJs } from './formatCode';
import { theme } from './theme';
import { debounce } from '$lib/utils';

const vimMode = new Compartment();

const extensions: Extension[] = [
	basicSetup,
	javascript(),
	EditorState.tabSize.of(2),
	theme,
	vimMode.of([])
];

type Props = {
	defaultCode?: string;
	container: HTMLElement;
	onChange: (value: string) => void;
};

export class Workspace {
	view: EditorView;
	#tsServer: TsServer;
	#onCodeChange: (value: string) => void;

	constructor({ defaultCode, container, onChange }: Props) {
		this.#onCodeChange = debounce(onChange, 200);
		this.#tsServer = new TsServer();

		const state = EditorState.create({
			doc: defaultCode || '',
			extensions: [
				...extensions,
				linter(
					async () => {
						return await this.#tsServer.lint();
					},
					{ delay: 0 }
				),
				autocompletion({
					activateOnTyping: true,
					override: [this.#tsServer.autocomplete],
					defaultKeymap: true
				}),
				keymap.of([...defaultKeymap, { key: 'Tab', run: acceptCompletion }, indentWithTab]),
				EditorView.updateListener.of(this.#handleChange)
			]
		});

		this.view = new EditorView({
			state,
			parent: container
		});
	}

	#handleChange = (view: ViewUpdate) => {
		const code = view.state.doc.toString();
		this.#tsServer.update(code);
		if (view.docChanged) this.#onCodeChange(code);
	};

	toggleVim(value: boolean) {
		const ext = value ? vim() : [];
		this.view.dispatch({
			effects: vimMode.reconfigure(ext)
		});
	}

	formatCode() {
		this.view.dispatch({
			changes: {
				from: 0,
				to: this.view.state.doc.length,
				insert: formatJs(this.view.state.doc.toString())
			}
		});
	}

	updateCode(newCode: string) {
		if (newCode === this.view.state.doc.toString()) return;
		this.view.dispatch({
			changes: {
				from: 0,
				to: this.view.state.doc.length,
				insert: newCode
			}
		});
	}
}
