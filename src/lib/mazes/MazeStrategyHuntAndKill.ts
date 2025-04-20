import { MazeBase, type Cell } from './MazeBase';

export class MazeStrategyHuntAndKill extends MazeBase {
	private currentCell: Cell | null = null;

	async generate(): Promise<void> {
		// Start from the top-left cell
		this.currentCell = this.grid[0][0];
		this.currentCell.visited = true;
		this.currentCell.current = true;
		this.draw();
		await this.delay();

		while (this.currentCell) {
			const nextCell = this.getRandomUnvisitedNeighbor(this.currentCell);

			if (nextCell) {
				this.removeWallsBetween(this.currentCell, nextCell);
				nextCell.visited = true;
				this.currentCell.current = false;
				nextCell.current = true;
				this.currentCell = nextCell;
				this.draw();
				await this.delay();
			} else {
				// Hunt mode: look for a new starting point
				this.currentCell.current = false;
				this.draw();
				await this.delay();

				this.currentCell = await this.hunt();
			}
		}
	}

	private getRandomUnvisitedNeighbor(cell: Cell): Cell | null {
		const neighbors: Cell[] = [];
		const { x, y } = cell;

		// Check all four directions
		if (y > 0 && !this.grid[y - 1][x].visited) neighbors.push(this.grid[y - 1][x]); // Top
		if (x < this.width - 1 && !this.grid[y][x + 1].visited) neighbors.push(this.grid[y][x + 1]); // Right
		if (y < this.height - 1 && !this.grid[y + 1][x].visited) neighbors.push(this.grid[y + 1][x]); // Bottom
		if (x > 0 && !this.grid[y][x - 1].visited) neighbors.push(this.grid[y][x - 1]); // Left

		if (neighbors.length === 0) return null;
		return neighbors[Math.floor(Math.random() * neighbors.length)];
	}

	private async hunt(): Promise<Cell | null> {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const cell = this.grid[y][x];
				cell.current = true;
				this.draw();
				await this.delay();

				if (!cell.visited && this.hasVisitedNeighbor(cell)) {
					const visitedNeighbor = this.getRandomVisitedNeighbor(cell);
					if (visitedNeighbor) {
						this.removeWallsBetween(cell, visitedNeighbor);
						cell.visited = true;
						return cell;
					}
				}

				cell.current = false;
			}
		}
		return null;
	}

	private hasVisitedNeighbor(cell: Cell): boolean {
		const { x, y } = cell;
		return (
			(y > 0 && this.grid[y - 1][x].visited) ||
			(x < this.width - 1 && this.grid[y][x + 1].visited) ||
			(y < this.height - 1 && this.grid[y + 1][x].visited) ||
			(x > 0 && this.grid[y][x - 1].visited)
		);
	}

	private getRandomVisitedNeighbor(cell: Cell): Cell | null {
		const neighbors: Cell[] = [];
		const { x, y } = cell;

		if (y > 0 && this.grid[y - 1][x].visited) neighbors.push(this.grid[y - 1][x]);
		if (x < this.width - 1 && this.grid[y][x + 1].visited) neighbors.push(this.grid[y][x + 1]);
		if (y < this.height - 1 && this.grid[y + 1][x].visited) neighbors.push(this.grid[y + 1][x]);
		if (x > 0 && this.grid[y][x - 1].visited) neighbors.push(this.grid[y][x - 1]);

		if (neighbors.length === 0) return null;
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
