import { MazeBase, type Cell } from './MazeBase';

export class MazeStrategyRecursiveBacktracker extends MazeBase {
	async generate(): Promise<void> {
		const startCell = this.grid[0][0];
		const stack: Cell[] = [startCell];
		startCell.visited = true;
		startCell.current = true;
		this.draw();

		while (stack.length > 0) {
			const current = stack[stack.length - 1];
			current.current = true;
			this.draw();
			await this.delay();

			const neighbors = this.getUnvisitedNeighbors(current);

			if (neighbors.length === 0) {
				current.current = false;
				stack.pop();
				if (stack.length > 0) {
					stack[stack.length - 1].current = true;
				}
			} else {
				const next = neighbors[Math.floor(Math.random() * neighbors.length)];
				this.removeWalls(current, next);
				next.visited = true;
				current.current = false;
				next.current = true;
				stack.push(next);
			}

			this.draw();
			await this.delay();
		}
	}

	private getUnvisitedNeighbors(cell: Cell): Cell[] {
		const neighbors: Cell[] = [];
		const { x, y } = cell;

		// Check all four directions
		const directions = [
			{ dx: 0, dy: -1 }, // top
			{ dx: 1, dy: 0 }, // right
			{ dx: 0, dy: 1 }, // bottom
			{ dx: -1, dy: 0 } // left
		];

		for (const dir of directions) {
			const newX = x + dir.dx;
			const newY = y + dir.dy;

			if (
				newX >= 0 &&
				newX < this.width &&
				newY >= 0 &&
				newY < this.height &&
				!this.grid[newY][newX].visited
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
