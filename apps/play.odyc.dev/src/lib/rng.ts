export class Rng {
	seed: number;
	#x: number;
	#y: number;
	#z: number;
	#w: number;

	constructor(seed?: number) {
		this.seed = seed ?? Date.now();
		this.#x = this.seed & 0xffffffff;
		this.#y = 362436069;
		this.#z = 521288629;
		this.#w = 88675123;
		for (let i = 0; i < 32; i++) this.#uint32();
	}

	#uint32() {
		const t = this.#x ^ ((this.#x << 11) & 0xffffffff);
		this.#x = this.#y;
		this.#y = this.#z;
		this.#z = this.#w;
		this.#w = this.#w ^ (this.#w >>> 19) ^ (t ^ (t >>> 8));
		return this.#w + 0x80000000;
	}

	number(min?: number, max?: number) {
		if (min === undefined) {
			min = 0;
			max = 1;
		} else if (max === undefined) {
			max = min;
			min = 0;
		}
		return min + ((max - min) * this.#uint32()) / 0xffffffff;
	}

	boolean(trueProbability = 0.5) {
		return this.number(0, 1) < trueProbability;
	}

	fromArray<T>(array: T[]) {
		return array[Math.floor(this.number(0, array.length))] as T;
	}
}
