/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import type { Diagnostic } from '@codemirror/lint';
import {
	createDefaultMapFromCDN,
	createSystem,
	createVirtualTypeScriptEnvironment,
	type VirtualTypeScriptEnvironment
} from '@typescript/vfs';
import lzstring from 'lz-string';
import odycTypes from 'odyc/dist/index.d.ts?raw';
import pfxrTypes from 'pfxr/dist/index.d.ts?raw';
import ts, { type QuickInfo } from 'typescript';

let filesMap: Map<string, string> | undefined = undefined;
let tsEnv: VirtualTypeScriptEnvironment | undefined = undefined;
let currentCode = ' ';

const ENTRYPOINT = '/index.js';

init();

addEventListener('message', (e) => {
	const port = e.data as MessagePort;
	port.onmessage = (e) => {
		const { id, type, payload } = e.data as { id: number; type: string; payload: any };

		switch (type) {
			case 'upload-code':
				updateCode(payload.code as string);
				port.postMessage({ id });
				break;
			case 'autocomplete':
				port.postMessage({ id, result: { entries: complete(payload.pos as number) } });
				break;
			case 'lint':
				port.postMessage({ id, result: { diagnostics: lint() } });
				break;
			case 'tooltip':
				port.postMessage({ id, result: { ...tooltip(payload.pos as number) } });
				break;
		}
	};
});

async function init() {
	const compilerOptions = {
		target: ts.ScriptTarget.ES2016,
		lib: ['es2017', 'dom'],
		allowJs: true,
		checkJs: true
	};

	filesMap = await createDefaultMapFromCDN(compilerOptions, ts.version, false, ts, lzstring);
	filesMap.set('/node_modules/odyc/index.d.ts', odycTypes);
	filesMap.set('/node_modules/pfxr/index.d.ts', pfxrTypes);

	filesMap.set(
		'/extra.d.ts',
		`
      import type { createGame as createGameImpl, createSound as createSoundImpl, charToSprite as charToSpriteImpl, vec2 as vec2Impl, tick as tickImpl, mergeSprites as mergeSpritesImpl  } from "odyc";
      declare global { 
      const createGame: typeof createGameImpl;
      const createSound: typeof createSoundImpl;
      const charToSprite: typeof charToSpriteImpl;
      const vec2: typeof vec2Impl;
      const tick: typeof tickImpl;
      const mergeSprites: typeof mergeSpritesImpl;
      }
      `
	);
	filesMap.set(ENTRYPOINT, currentCode || ' ');

	tsEnv = createVirtualTypeScriptEnvironment(
		createSystem(filesMap),
		[ENTRYPOINT, '/extra.d.ts'],
		ts,
		compilerOptions
	);
}

function updateCode(code: string) {
	currentCode = code;
	tsEnv?.updateFile(ENTRYPOINT, currentCode || ' ');
}

function complete(pos: number) {
	return tsEnv?.languageService.getCompletionsAtPosition(ENTRYPOINT, pos, { triggerKind: 1 });
}

function lint(): Diagnostic[] {
	if (!tsEnv) return [];
	const tsErrors = tsEnv.languageService
		.getSemanticDiagnostics('index.js')
		.concat(tsEnv.languageService.getSyntacticDiagnostics('index.js'));
	return tsErrors.map((tsError) => ({
		from: tsError.start ?? 0,
		to: (tsError.start ?? 0) + (tsError.length ?? 0),
		severity: 'error',
		message:
			typeof tsError.messageText === 'string'
				? tsError.messageText
				: tsError.messageText.messageText
	}));
}

function tooltip(pos: number): { result?: QuickInfo; tooltipText: string } {
	const result = tsEnv?.languageService.getQuickInfoAtPosition(ENTRYPOINT, pos);
	if (!result)
		return {
			result,
			tooltipText: ''
		};
	return {
		result,
		tooltipText:
			ts.displayPartsToString(result.displayParts) +
			(result.documentation?.length ? '\n' + ts.displayPartsToString(result.documentation) : '')
	};
}
