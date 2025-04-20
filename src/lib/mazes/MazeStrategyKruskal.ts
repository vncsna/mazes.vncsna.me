import { MazeBase } from './MazeBase';

type Wall = {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	isHorizontal: boolean;
};

type DisjointSet = {
	parent: number;
	rank: number;
};

export class MazeStrategyKruskal extends MazeBase {
	private sets: DisjointSet[] = [];
	private walls: Wall[] = [];

	private find(x: number): number {
		if (this.sets[x].parent !== x) {
			this.sets[x].parent = this.find(this.sets[x].parent);
		}
		return this.sets[x].parent;
	}

	private union(x: number, y: number): void {
		const rootX = this.find(x);
		const rootY = this.find(y);

		if (rootX === rootY) return;

		if (this.sets[rootX].rank < this.sets[rootY].rank) {
			this.sets[rootX].parent = rootY;
		} else if (this.sets[rootX].rank > this.sets[rootY].rank) {
			this.sets[rootY].parent = rootX;
		} else {
			this.sets[rootY].parent = rootX;
			this.sets[rootX].rank++;
		}
	}

	private getCellIndex(x: number, y: number): number {
		return y * this.width + x;
	}

	private initializeSets(): void {
		// Initialize disjoint sets for each cell
		for (let i = 0; i < this.width * this.height; i++) {
			this.sets.push({ parent: i, rank: 0 });
		}
	}

	private initializeWalls(): void {
		// Create list of all walls
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				// Add right wall if not on right edge
				if (x < this.width - 1) {
					this.walls.push({
						x1: x,
						y1: y,
						x2: x + 1,
						y2: y,
						isHorizontal: false
					});
				}
				// Add bottom wall if not on bottom edge
				if (y < this.height - 1) {
					this.walls.push({
						x1: x,
						y1: y,
						x2: x,
						y2: y + 1,
						isHorizontal: true
					});
				}
			}
		}
	}

	private removeWall(wall: Wall): void {
		const cell1 = this.grid[wall.y1][wall.x1];
		const cell2 = this.grid[wall.y2][wall.x2];

		if (wall.isHorizontal) {
			cell1.walls.bottom = false;
			cell2.walls.top = false;
		} else {
			cell1.walls.right = false;
			cell2.walls.left = false;
		}

		cell1.visited = true;
		cell2.visited = true;
	}

	async generate(): Promise<void> {
		this.initializeGrid();
		this.initializeSets();
		this.initializeWalls();

		// Shuffle walls
		for (let i = this.walls.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.walls[i], this.walls[j]] = [this.walls[j], this.walls[i]];
		}

		while (this.walls.length > 0) {
			const wall = this.walls.pop()!;
			const cell1Index = this.getCellIndex(wall.x1, wall.y1);
			const cell2Index = this.getCellIndex(wall.x2, wall.y2);

			if (this.find(cell1Index) !== this.find(cell2Index)) {
				this.union(cell1Index, cell2Index);
				this.removeWall(wall);

				// Mark current cells for visualization
				this.grid[wall.y1][wall.x1].current = true;
				this.grid[wall.y2][wall.x2].current = true;
				this.draw();
				await this.delay();
				this.grid[wall.y1][wall.x1].current = false;
				this.grid[wall.y2][wall.x2].current = false;
			}
		}

		this.draw();
	}
}
