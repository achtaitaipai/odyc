import { type CompletionSource } from '@codemirror/autocomplete';
import type { Diagnostic } from '@codemirror/lint';
import type { VirtualTypeScriptEnvironment } from '@typescript/vfs';
import type { EditorView } from 'codemirror';
import type { QuickInfo } from 'typescript';

export class TsServer {
	#worker: Worker;
	#listeners = new Map<
		number,
		{ resolve: (value: unknown) => void; reject: (err: unknown) => void }
	>();
	#messageChannel: MessageChannel;
	#lastId = 0;

	constructor() {
		this.#worker = new Worker(new URL('./tsServer.worker.ts', import.meta.url), {
			type: 'module'
		});

		this.#messageChannel = new MessageChannel();

		this.#worker.postMessage(this.#messageChannel.port1, [this.#messageChannel.port1]);

		this.#messageChannel.port2.onmessage = this.#handleMessage;
	}

	#handleMessage = (e: MessageEvent) => {
		const { id, result, error } = e.data;
		const handler = this.#listeners.get(id);
		if (!handler) return;
		this.#listeners.delete(id);
		error ? handler.reject(error) : handler.resolve(result);
	};

	#rpc(type: string, payload: Object) {
		const id = ++this.#lastId;
		return new Promise((resolve, reject) => {
			this.#listeners.set(id, { resolve, reject });
			this.#messageChannel.port2.postMessage({ id, type, payload });
		});
	}

	update(code: string) {
		this.#rpc('upload-code', { code });
	}

	autocomplete: CompletionSource = async (ctx) => {
		const result = (await this.#rpc('autocomplete', { pos: ctx.pos })) as {
			entries: ReturnType<
				VirtualTypeScriptEnvironment['languageService']['getCompletionsAtPosition']
			>;
		};
		const completions = result.entries;
		if (!completions) return null;

		const text = ctx.state.doc.toString();

		let from: number | undefined = undefined;

		for (let i = ctx.pos - 1; i >= 0; i--) {
			if ([' ', '.', '\n', '"', "'"].includes(text[i]) || i === 0) {
				from = i === 0 ? i : i + 1;
				const lastWord = text.slice(from, ctx.pos).trim();
				completions.entries = completions.entries.filter((completion) =>
					completion.name.startsWith(lastWord)
				);
				break;
			}
		}

		return {
			from: from ?? ctx.pos,
			options: completions.entries.map((completion) => {
				return {
					label: completion.name,
					type: completion.kind
				};
			})
		};
	};

	async lint() {
		const result = (await this.#rpc('lint', {})) as { diagnostics: Diagnostic[] };
		return result.diagnostics;
	}

	async hoverTooltip(pos: number) {
		const { result, tooltipText } = (await this.#rpc('tooltip', { pos })) as {
			result?: QuickInfo;
			tooltipText: string;
		};
		if (!result) return null;
		return {
			pos,
			create() {
				const dom = document.createElement('div');
				dom.setAttribute('class', 'cm-quickinfo-tooltip');
				dom.textContent = tooltipText;

				return { dom };
			}
		};
	}
}
