import { MazeBase, type Cell } from './MazeBase';

export class MazeStrategyEller extends MazeBase {
	private sets: Map<number, Set<Cell>> = new Map();
	private nextSetId = 1;

	async generate(): Promise<void> {
		// Process each row
		for (let y = 0; y < this.height; y++) {
			await this.initializeRow(y);
			await this.joinCellsInRow(y);

			if (y < this.height - 1) {
				await this.connectWithNextRow(y);
			} else {
				// Last row: connect all adjacent cells in different sets
				await this.connectLastRow(y);
			}
		}
	}

	private async initializeRow(y: number): Promise<void> {
		// Initialize each cell in its own set if not already in a set
		for (let x = 0; x < this.width; x++) {
			const cell = this.grid[y][x];
			cell.current = true;
			this.draw();
			await this.delay();

			if (!this.findSetForCell(cell)) {
				const newSet = new Set<Cell>([cell]);
				this.sets.set(this.nextSetId++, newSet);
			}

			cell.visited = true;
			cell.current = false;
		}
	}

	private async joinCellsInRow(y: number): Promise<void> {
		// Randomly join adjacent cells in the row
		for (let x = 0; x < this.width - 1; x++) {
			const cell1 = this.grid[y][x];
			const cell2 = this.grid[y][x + 1];

			cell1.current = true;
			cell2.current = true;
			this.draw();
			await this.delay();

			if (Math.random() < 0.5 && !this.areInSameSet(cell1, cell2)) {
				this.mergeSets(cell1, cell2);
				this.removeWallsBetween(cell1, cell2);
			}

			cell1.current = false;
			if (x === this.width - 2) {
				cell2.current = false;
			}
		}
	}

	private async connectWithNextRow(y: number): Promise<void> {
		// For each set in the current row, ensure at least one vertical connection
		const setConnections = new Map<number, boolean>();

		// Randomly connect cells with the row below
		for (let x = 0; x < this.width; x++) {
			const upperCell = this.grid[y][x];
			const lowerCell = this.grid[y + 1][x];
			const setId = this.findSetIdForCell(upperCell);

			upperCell.current = true;
			lowerCell.current = true;
			this.draw();
			await this.delay();

			if (Math.random() < 0.3) {
				this.removeWallsBetween(upperCell, lowerCell);
				setConnections.set(setId, true);
				// Add lower cell to the same set
				const set = this.sets.get(setId)!;
				set.add(lowerCell);
			}

			upperCell.current = false;
			lowerCell.current = false;
		}

		// Ensure at least one connection for each set
		for (let x = 0; x < this.width; x++) {
			const upperCell = this.grid[y][x];
			const setId = this.findSetIdForCell(upperCell);

			if (!setConnections.get(setId)) {
				const lowerCell = this.grid[y + 1][x];

				upperCell.current = true;
				lowerCell.current = true;
				this.draw();
				await this.delay();

				this.removeWallsBetween(upperCell, lowerCell);
				setConnections.set(setId, true);
				// Add lower cell to the same set
				const set = this.sets.get(setId)!;
				set.add(lowerCell);

				upperCell.current = false;
				lowerCell.current = false;
			}
		}
	}

	private async connectLastRow(y: number): Promise<void> {
		for (let x = 0; x < this.width - 1; x++) {
			const cell1 = this.grid[y][x];
			const cell2 = this.grid[y][x + 1];

			cell1.current = true;
			cell2.current = true;
			this.draw();
			await this.delay();

			if (!this.areInSameSet(cell1, cell2)) {
				this.mergeSets(cell1, cell2);
				this.removeWallsBetween(cell1, cell2);
			}

			cell1.current = false;
			if (x === this.width - 2) {
				cell2.current = false;
			}
		}
	}

	private findSetForCell(cell: Cell): Set<Cell> | null {
		for (const set of this.sets.values()) {
			if (set.has(cell)) return set;
		}
		return null;
	}

	private findSetIdForCell(cell: Cell): number {
		for (const [id, set] of this.sets.entries()) {
			if (set.has(cell)) return id;
		}
		return -1;
	}

	private areInSameSet(cell1: Cell, cell2: Cell): boolean {
		const set1 = this.findSetForCell(cell1);
		return set1?.has(cell2) ?? false;
	}

	private mergeSets(cell1: Cell, cell2: Cell): void {
		const set1 = this.findSetForCell(cell1);
		const set2 = this.findSetForCell(cell2);

		if (set1 && set2 && set1 !== set2) {
			// Merge set2 into set1
			for (const cell of set2) {
				set1.add(cell);
			}
			// Remove set2
			for (const [id, set] of this.sets.entries()) {
				if (set === set2) {
					this.sets.delete(id);
					break;
				}
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
