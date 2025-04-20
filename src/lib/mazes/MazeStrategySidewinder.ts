import { MazeBase, type Cell } from './MazeBase';

export class MazeStrategySidewinder extends MazeBase {
	async generate(): Promise<void> {
		// Create the top row with no walls
		for (let x = 0; x < this.width - 1; x++) {
			const cell = this.grid[0][x];
			const nextCell = this.grid[0][x + 1];

			cell.current = true;
			nextCell.current = true;
			this.draw();
			await this.delay();

			this.removeWallsBetween(cell, nextCell);
			cell.visited = true;

			cell.current = false;
			if (x === this.width - 2) {
				nextCell.visited = true;
				nextCell.current = false;
			}
		}

		// Process all other rows
		for (let y = 1; y < this.height; y++) {
			let runStart = 0;
			let currentRun: Cell[] = [];

			for (let x = 0; x < this.width; x++) {
				const cell = this.grid[y][x];
				cell.current = true;
				currentRun.push(cell);
				this.draw();
				await this.delay();

				// Decide whether to close out the current run
				const atEasternBoundary = x === this.width - 1;
				const shouldCloseOut = atEasternBoundary || Math.random() < 0.5;

				if (shouldCloseOut) {
					// Choose a random cell from the run and connect it to the cell above
					const randomX = runStart + Math.floor(Math.random() * (x - runStart + 1));
					const randomCell = this.grid[y][randomX];
					const cellAbove = this.grid[y - 1][randomX];

					randomCell.current = true;
					cellAbove.current = true;
					this.draw();
					await this.delay();

					this.removeWallsBetween(randomCell, cellAbove);

					// Mark all cells in the run as visited and not current
					for (const runCell of currentRun) {
						runCell.visited = true;
						runCell.current = false;
					}
					cellAbove.current = false;

					// Start a new run
					runStart = x + 1;
					currentRun = [];
				} else if (x < this.width - 1) {
					// Add the current cell to the run by removing the wall to its right
					const nextCell = this.grid[y][x + 1];
					nextCell.current = true;
					this.draw();
					await this.delay();

					this.removeWallsBetween(cell, nextCell);
				}
			}

			// Mark any remaining cells in the run as visited
			for (const cell of currentRun) {
				cell.visited = true;
				cell.current = false;
			}
			this.draw();
			await this.delay();
		}
	}

	private removeWallsBetween(cell1: Cell, cell2: Cell): void {
		const dx = cell2.x - cell1.x;
		const dy = cell2.y - cell1.y;

		if (dx === 1) {
			// cell2 is to the right of cell1
			cell1.walls.right = false;
			cell2.walls.left = false;
		} else if (dx === -1) {
			// cell2 is to the left of cell1
			cell1.walls.left = false;
			cell2.walls.right = false;
		} else if (dy === 1) {
			// cell2 is below cell1
			cell1.walls.bottom = false;
			cell2.walls.top = false;
		} else if (dy === -1) {
			// cell2 is above cell1
			cell1.walls.top = false;
			cell2.walls.bottom = false;
		}
	}
}
