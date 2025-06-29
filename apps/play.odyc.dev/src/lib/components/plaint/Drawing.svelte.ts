import { OdycColorsHEX, OdycColorsRGB } from '$lib/constants';

export class Drawing {
	#grid: number[][] = [];
	#width = $state(8);
	#height = $state(8);
	constructor(sprite?: string) {
		this.updateSprite(sprite);
	}

	updateSprite(sprite?: string) {
		this.#grid = this.#createGrid(this.#width, this.#height);
		if (sprite) this.text = sprite;
	}

	display(ctx: CanvasRenderingContext2D) {
		this.#drawBg(ctx);
		for (let y = 0; y < this.#grid.length; y++) {
			const row = this.#grid[y];
			for (let x = 0; x < row.length; x++) {
				const colorIndex = row[x];
				if (OdycColorsHEX[colorIndex]) {
					ctx.fillStyle = OdycColorsHEX[colorIndex];
					ctx.fillRect(x, y, 1, 1);
				}
			}
		}
	}

	clear() {
		this.#grid = this.#createGrid(this.#width, this.#height);
	}

	putPixel(x: number, y: number, value: number) {
		this.#grid[y][x] = value;
	}

	mirror(vertical = false) {
		const newGrid = this.#createGrid(this.#width, this.#height);
		for (let y = 0; y < this.#height; y++) {
			for (let x = 0; x < this.#width; x++) {
				const posX = vertical ? x : this.#width - x - 1;
				const posY = vertical ? this.#height - y - 1 : y;
				newGrid[y][x] = this.#grid[posY][posX];
			}
		}
		this.#grid = newGrid;
	}

	rotate() {
		const newGrid = this.#createGrid(this.#height, this.#width);
		for (let y = 0; y < this.#height; y++) {
			for (let x = 0; x < this.#width; x++) {
				newGrid[x][this.#height - 1 - y] = this.#grid[y][x];
			}
		}
		[this.#height, this.#width] = [this.#width, this.#height];
		this.#grid = newGrid;
	}

	move(translateX: number, translateY: number) {
		const newGrid = this.#createGrid(this.#width, this.#height);
		for (let y = 0; y < this.#height; y++) {
			for (let x = 0; x < this.#width; x++) {
				newGrid[y][x] = this.#grid[y - translateY]?.[x - translateX] ?? -1;
			}
		}
		this.#grid = newGrid;
	}

	resize(width: number, height: number) {
		const newGrid = this.#createGrid(width, height);
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const c = this.#grid[y]?.[x];
				if (c !== undefined) newGrid[y][x] = c;
			}
		}
		this.#width = width;
		this.#height = height;
		this.#grid = newGrid;
	}

	get text() {
		let result = '';
		for (let y = 0; y < this.#height; y++) {
			for (let x = 0; x < this.#width; x++) {
				const colorIndex = this.#grid[y][x];
				result += OdycColorsHEX[colorIndex] ? colorIndex.toString() : '.';
			}
			result += '\n';
		}
		return result;
	}

	set text(value: string) {
		const rows = value
			.replace(/'|"|`/gm, '')
			.trim() //removes whitespace from both ends
			.replace(/[ \t]/gm, '') //removes tabs and whitespaces
			.split(/\n+/gm); //split by lines and ignore multiple return
		const height = rows.length;
		const width = Math.max(...rows.map((row) => row.length));

		let newGrid = this.#createGrid(width, height);

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const char = rows[y]?.charAt(x);
				const color = /\d/.test(char) ? Number(char) : -1;
				newGrid[y][x] = color;
			}
		}
		this.#grid = newGrid;
		this.#width = width;
		this.#height = height;
	}

	get width() {
		return this.#width;
	}

	get height() {
		return this.#height;
	}

	async loadImgFile(file: File) {
		const img = await this.fileToImage(file);
		if (img.width <= 1 || img.height <= 1 || img.width > 24 || img.height > 24) {
			throw new Error('Images with these dimensions cannot be loaded.');
		}
		const imgData = this.#getImgData(img);
		const newGrid = this.#createGrid(img.width, img.height);
		for (let index = 0; index < imgData.data.length; index += 4) {
			const pixelIndex = index / 4;
			const y = Math.floor(pixelIndex / img.width);
			const x = pixelIndex % img.width;
			const [r, g, b] = imgData.data.slice(index, index + 4);
			const colorIndex = OdycColorsRGB.findIndex((el) => {
				let diff = Math.abs(el[0] - r);
				diff += Math.abs(el[1] - g);
				diff += Math.abs(el[2] - b);
				return diff < 10;
			});
			newGrid[y][x] = colorIndex;
		}
		this.#width = img.width;
		this.#height = img.height;
		this.#grid = newGrid;
	}

	async fileToImage(file: File): Promise<HTMLImageElement> {
		if (!file.type.startsWith('image/')) {
			throw new Error('The provided file is not an image.');
		}

		return new Promise((resolve, reject) => {
			const url = URL.createObjectURL(file);
			const img = new Image();

			img.onload = () => {
				URL.revokeObjectURL(url);
				resolve(img);
			};

			img.onerror = () => {
				URL.revokeObjectURL(url);
				reject(new Error('Failed to load the image.'));
			};

			img.src = url;
		});
	}

	#getImgData(img: HTMLImageElement) {
		const canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('Failed to load the image.');
		ctx.drawImage(img, 0, 0);
		return ctx.getImageData(0, 0, img.width, img.height);
	}

	#createGrid(width: number, height: number) {
		return [...new Array(height)].map(() => [...new Array(width)].map(() => -1));
	}

	#drawBg(ctx: CanvasRenderingContext2D) {
		for (let y = 0; y < this.#height; y++) {
			for (let x = 0; x < this.#width; x++) {
				ctx.fillStyle = (x + y) % 2 === 0 ? '#C0C0C0' : '#909090';
				ctx.fillRect(x, y, 1, 1);
			}
		}
	}
}
