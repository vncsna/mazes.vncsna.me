import { MazeBase } from './MazeBase';

type Chamber = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export class MazeStrategyRecursiveDivision extends MazeBase {
	async generate(): Promise<void> {
		this.initializeGrid();

		// Start with all walls removed
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const cell = this.grid[y][x];
				cell.walls = {
					top: y === 0,
					right: x === this.width - 1,
					bottom: y === this.height - 1,
					left: x === 0
				};
				cell.visited = true;
			}
		}

		await this.divide({
			x: 0,
			y: 0,
			width: this.width,
			height: this.height
		});

		this.draw();
	}

	private async divide(chamber: Chamber): Promise<void> {
		if (chamber.width <= 2 || chamber.height <= 2) return;

		const horizontal = chamber.width < chamber.height;

		if (horizontal) {
			// Horizontal division
			const y = chamber.y + Math.floor(Math.random() * (chamber.height - 2)) + 1;
			const passageX = chamber.x + Math.floor(Math.random() * chamber.width);

			// Add horizontal wall with one passage
			for (let x = chamber.x; x < chamber.x + chamber.width; x++) {
				if (x !== passageX) {
					this.grid[y][x].walls.bottom = true;
					this.grid[y + 1][x].walls.top = true;
					this.grid[y][x].current = true;
					this.grid[y + 1][x].current = true;
					this.draw();
					await this.delay();
					this.grid[y][x].current = false;
					this.grid[y + 1][x].current = false;
				}
			}

			// Recursively divide the chambers above and below the wall
			await this.divide({
				x: chamber.x,
				y: chamber.y,
				width: chamber.width,
				height: y - chamber.y + 1
			});

			await this.divide({
				x: chamber.x,
				y: y + 1,
				width: chamber.width,
				height: chamber.height - (y - chamber.y + 1)
			});
		} else {
			// Vertical division
			const x = chamber.x + Math.floor(Math.random() * (chamber.width - 2)) + 1;
			const passageY = chamber.y + Math.floor(Math.random() * chamber.height);

			// Add vertical wall with one passage
			for (let y = chamber.y; y < chamber.y + chamber.height; y++) {
				if (y !== passageY) {
					this.grid[y][x].walls.right = true;
					this.grid[y][x + 1].walls.left = true;
					this.grid[y][x].current = true;
					this.grid[y][x + 1].current = true;
					this.draw();
					await this.delay();
					this.grid[y][x].current = false;
					this.grid[y][x + 1].current = false;
				}
			}

			// Recursively divide the chambers to the left and right of the wall
			await this.divide({
				x: chamber.x,
				y: chamber.y,
				width: x - chamber.x + 1,
				height: chamber.height
			});

			await this.divide({
				x: x + 1,
				y: chamber.y,
				width: chamber.width - (x - chamber.x + 1),
				height: chamber.height
			});
		}
	}
}
