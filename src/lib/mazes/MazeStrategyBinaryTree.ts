import { MazeBase, type Cell } from './MazeBase';

export class MazeStrategyBinaryTree extends MazeBase {
	async generate(): Promise<void> {
		// Process each cell
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const cell = this.grid[y][x];
				cell.current = true;
				this.draw();
				await this.delay();

				const possibleConnections: Cell[] = [];

				// Can we go up?
				if (y > 0) {
					possibleConnections.push(this.grid[y - 1][x]);
				}

				// Can we go right?
				if (x < this.width - 1) {
					possibleConnections.push(this.grid[y][x + 1]);
				}

				// If we have possible connections, randomly choose one
				if (possibleConnections.length > 0) {
					const nextCell =
						possibleConnections[Math.floor(Math.random() * possibleConnections.length)];
					nextCell.current = true;
					this.draw();
					await this.delay();

					this.removeWallsBetween(cell, nextCell);
					nextCell.current = false;
				}

				cell.visited = true;
				cell.current = false;
				this.draw();
				await this.delay();
			}
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
