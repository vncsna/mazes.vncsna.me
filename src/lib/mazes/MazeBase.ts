import { colors } from '$lib/theme/colors';

export type Cell = {
	x: number;
	y: number;
	walls: {
		top: boolean;
		right: boolean;
		bottom: boolean;
		left: boolean;
	};
	visited: boolean;
	current?: boolean; // New property to highlight current cell
};

export abstract class MazeBase {
	protected grid: Cell[][] = [];
	protected width: number;
	protected height: number;
	protected cellSize: number;
	protected animationDelay: number = 10; // 10ms delay between steps
	protected ctx?: CanvasRenderingContext2D;
	protected isCancelled: boolean = false;

	constructor(width: number, height: number, cellSize: number) {
		this.width = width;
		this.height = height;
		this.cellSize = cellSize;
		this.initializeGrid();
	}

	protected initializeGrid(): void {
		this.isCancelled = false;
		for (let y = 0; y < this.height; y++) {
			this.grid[y] = [];
			for (let x = 0; x < this.width; x++) {
				this.grid[y][x] = {
					x,
					y,
					walls: {
						top: true,
						right: true,
						bottom: true,
						left: true
					},
					visited: false,
					current: false
				};
			}
		}
	}

	abstract generate(): Promise<void>; // Changed to async

	setContext(ctx: CanvasRenderingContext2D): void {
		this.ctx = ctx;
	}

	cancel(): void {
		this.isCancelled = true;
	}

	protected async delay(): Promise<void> {
		if (this.isCancelled) {
			throw new Error('Generation cancelled');
		}
		await new Promise((resolve) => setTimeout(resolve, this.animationDelay));
	}

	draw(ctx: CanvasRenderingContext2D = this.ctx!): void {
		ctx.clearRect(0, 0, this.width * this.cellSize, this.height * this.cellSize);

		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const cell = this.grid[y][x];
				const startX = x * this.cellSize;
				const startY = y * this.cellSize;

				// Fill cell based on state
				if (cell.current) {
					ctx.fillStyle = colors.maze.currentCell;
					ctx.fillRect(startX, startY, this.cellSize, this.cellSize);
				} else if (cell.visited) {
					ctx.fillStyle = colors.maze.visitedCell;
					ctx.fillRect(startX, startY, this.cellSize, this.cellSize);
				}

				// Draw walls
				ctx.strokeStyle = colors.maze.walls;
				ctx.lineWidth = 4;

				// Adjust positions to account for line width
				if (cell.walls.top) {
					ctx.beginPath();
					ctx.moveTo(startX - (x === 0 ? 1 : 0), startY);
					ctx.lineTo(startX + this.cellSize + (x === this.width - 1 ? 1 : 0), startY);
					ctx.stroke();
				}
				if (cell.walls.right) {
					ctx.beginPath();
					ctx.moveTo(startX + this.cellSize, startY - (y === 0 ? 1 : 0));
					ctx.lineTo(
						startX + this.cellSize,
						startY + this.cellSize + (y === this.height - 1 ? 1 : 0)
					);
					ctx.stroke();
				}
				if (cell.walls.bottom) {
					ctx.beginPath();
					ctx.moveTo(startX - (x === 0 ? 1 : 0), startY + this.cellSize);
					ctx.lineTo(
						startX + this.cellSize + (x === this.width - 1 ? 1 : 0),
						startY + this.cellSize
					);
					ctx.stroke();
				}
				if (cell.walls.left) {
					ctx.beginPath();
					ctx.moveTo(startX, startY - (y === 0 ? 1 : 0));
					ctx.lineTo(startX, startY + this.cellSize + (y === this.height - 1 ? 1 : 0));
					ctx.stroke();
				}
			}
		}
	}
}
