import { MazeBase, type Cell } from './MazeBase';

export class MazeStrategyPrims extends MazeBase {
	async generate(): Promise<void> {
		const frontier: Cell[] = [];
		const startCell =
			this.grid[Math.floor(Math.random() * this.height)][Math.floor(Math.random() * this.width)];
		startCell.visited = true;
		startCell.current = true;
		this.draw();
		await this.delay();

		this.addFrontier(startCell, frontier);

		while (frontier.length > 0) {
			const randomIndex = Math.floor(Math.random() * frontier.length);
			const current = frontier[randomIndex];
			frontier.splice(randomIndex, 1);

			current.current = true;
			this.draw();
			await this.delay();

			const neighbors = this.getVisitedNeighbors(current);
			if (neighbors.length > 0) {
				const neighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
				this.removeWalls(current, neighbor);
				current.visited = true;
				current.current = false;
				this.addFrontier(current, frontier);
			}

			this.draw();
			await this.delay();
		}
	}

	private addFrontier(cell: Cell, frontier: Cell[]): void {
		const directions = [
			{ dx: 0, dy: -1 },
			{ dx: 1, dy: 0 },
			{ dx: 0, dy: 1 },
			{ dx: -1, dy: 0 }
		];

		for (const dir of directions) {
			const newX = cell.x + dir.dx;
			const newY = cell.y + dir.dy;

			if (
				newX >= 0 &&
				newX < this.width &&
				newY >= 0 &&
				newY < this.height &&
				!this.grid[newY][newX].visited &&
				!frontier.includes(this.grid[newY][newX])
			) {
				frontier.push(this.grid[newY][newX]);
			}
		}
	}

	private getVisitedNeighbors(cell: Cell): Cell[] {
		const neighbors: Cell[] = [];
		const directions = [
			{ dx: 0, dy: -1 },
			{ dx: 1, dy: 0 },
			{ dx: 0, dy: 1 },
			{ dx: -1, dy: 0 }
		];

		for (const dir of directions) {
			const newX = cell.x + dir.dx;
			const newY = cell.y + dir.dy;

			if (
				newX >= 0 &&
				newX < this.width &&
				newY >= 0 &&
				newY < this.height &&
				this.grid[newY][newX].visited
			) {
				neighbors.push(this.grid[newY][newX]);
			}
		}

		return neighbors;
	}

	private removeWalls(current: Cell, next: Cell): void {
		const dx = next.x - current.x;
		const dy = next.y - current.y;

		if (dx === 1) {
			current.walls.right = false;
			next.walls.left = false;
		} else if (dx === -1) {
			current.walls.left = false;
			next.walls.right = false;
		}

		if (dy === 1) {
			current.walls.bottom = false;
			next.walls.top = false;
		} else if (dy === -1) {
			current.walls.top = false;
			next.walls.bottom = false;
		}
	}
}
