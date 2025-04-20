import { MazeBase } from './MazeBase';

type Direction = {
	dx: number;
	dy: number;
	wall: 'top' | 'right' | 'bottom' | 'left';
	opposite: 'top' | 'right' | 'bottom' | 'left';
};

export class MazeStrategyAldousBroder extends MazeBase {
	private readonly directions: Direction[] = [
		{ dx: 0, dy: -1, wall: 'top', opposite: 'bottom' }, // North
		{ dx: 1, dy: 0, wall: 'right', opposite: 'left' }, // East
		{ dx: 0, dy: 1, wall: 'bottom', opposite: 'top' }, // South
		{ dx: -1, dy: 0, wall: 'left', opposite: 'right' } // West
	];

	private getUnvisitedCellCount(): number {
		let count = 0;
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				if (!this.grid[y][x].visited) {
					count++;
				}
			}
		}
		return count;
	}

	private getValidNeighbors(x: number, y: number): Direction[] {
		return this.directions.filter((dir) => {
			const newX = x + dir.dx;
			const newY = y + dir.dy;
			return newX >= 0 && newX < this.width && newY >= 0 && newY < this.height;
		});
	}

	private removeWall(x: number, y: number, direction: Direction): void {
		const currentCell = this.grid[y][x];
		const nextCell = this.grid[y + direction.dy][x + direction.dx];

		currentCell.walls[direction.wall] = false;
		nextCell.walls[direction.opposite] = false;
	}

	async generate(): Promise<void> {
		this.initializeGrid();

		// Start from a random cell
		let currentX = Math.floor(Math.random() * this.width);
		let currentY = Math.floor(Math.random() * this.height);
		let unvisitedCount = this.width * this.height - 1; // Subtract 1 for starting cell

		this.grid[currentY][currentX].visited = true;
		this.grid[currentY][currentX].current = true;
		this.draw();
		await this.delay();

		while (unvisitedCount > 0) {
			// Get valid neighbors
			const validDirections = this.getValidNeighbors(currentX, currentY);
			const randomDirection = validDirections[Math.floor(Math.random() * validDirections.length)];

			// Move to the next cell
			const nextX = currentX + randomDirection.dx;
			const nextY = currentY + randomDirection.dy;
			const nextCell = this.grid[nextY][nextX];

			// If the next cell hasn't been visited, carve a path
			if (!nextCell.visited) {
				this.removeWall(currentX, currentY, randomDirection);
				nextCell.visited = true;
				unvisitedCount--;
			}

			// Update visualization
			this.grid[currentY][currentX].current = false;
			currentX = nextX;
			currentY = nextY;
			this.grid[currentY][currentX].current = true;
			this.draw();
			await this.delay();
		}

		// Clear current cell marker
		this.grid[currentY][currentX].current = false;
		this.draw();
	}
}
