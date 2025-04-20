import { MazeBase, type Cell } from './MazeBase';

export class MazeStrategyWilson extends MazeBase {
	private path: Cell[] = [];

	async generate(): Promise<void> {
		// Mark the first cell as visited
		this.grid[0][0].visited = true;
		this.grid[0][0].current = true;
		this.draw();
		await this.delay();
		this.grid[0][0].current = false;

		while (this.hasUnvisitedCells()) {
			const start = this.getRandomUnvisitedCell();
			if (!start) break;

			// Start a new random walk
			this.path = [start];
			let current = start;
			current.current = true;
			this.draw();
			await this.delay();

			// Continue the walk until we hit a visited cell
			while (!current.visited) {
				const next = this.getRandomNeighbor(current);
				const pathIndex = this.path.indexOf(next);

				// Clear current flag from the previous cell
				current.current = false;

				if (pathIndex !== -1) {
					// If we hit our own path, erase the loop
					// First, clear all cells after the loop point
					for (let i = pathIndex + 1; i < this.path.length; i++) {
						this.path[i].current = false;
					}
					this.path = this.path.slice(0, pathIndex + 1);
				} else {
					this.path.push(next);
				}

				// Update current cell and highlight the path
				current = next;
				current.current = true;

				// Highlight the entire current path
				for (const pathCell of this.path) {
					pathCell.current = true;
				}

				this.draw();
				await this.delay();
			}

			// Carve the path
			for (let i = 0; i < this.path.length - 1; i++) {
				const current = this.path[i];
				const next = this.path[i + 1];

				this.removeWallsBetween(current, next);
				current.visited = true;
				current.current = false;

				this.draw();
				await this.delay();
			}

			// Mark the last cell
			if (this.path.length > 0) {
				const last = this.path[this.path.length - 1];
				last.visited = true;
				last.current = false;
			}

			// Clear the path
			this.path = [];
			this.draw();
			await this.delay();
		}
	}

	private hasUnvisitedCells(): boolean {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				if (!this.grid[y][x].visited) return true;
			}
		}
		return false;
	}

	private getRandomUnvisitedCell(): Cell | null {
		const unvisited: Cell[] = [];
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				if (!this.grid[y][x].visited) {
					unvisited.push(this.grid[y][x]);
				}
			}
		}
		if (unvisited.length === 0) return null;
		return unvisited[Math.floor(Math.random() * unvisited.length)];
	}

	private getRandomNeighbor(cell: Cell): Cell {
		const neighbors: Cell[] = [];
		const { x, y } = cell;

		if (y > 0) neighbors.push(this.grid[y - 1][x]); // Top
		if (x < this.width - 1) neighbors.push(this.grid[y][x + 1]); // Right
		if (y < this.height - 1) neighbors.push(this.grid[y + 1][x]); // Bottom
		if (x > 0) neighbors.push(this.grid[y][x - 1]); // Left

		return neighbors[Math.floor(Math.random() * neighbors.length)];
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
