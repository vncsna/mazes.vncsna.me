import type { MazeBase } from './MazeBase';
import { MazeStrategyRecursiveBacktracker } from './MazeStrategyRecursiveBacktracker';
import { MazeStrategyPrims } from './MazeStrategyPrims';
import { MazeStrategyHuntAndKill } from './MazeStrategyHuntAndKill';
import { MazeStrategyWilson } from './MazeStrategyWilson';
import { MazeStrategyEller } from './MazeStrategyEller';
import { MazeStrategySidewinder } from './MazeStrategySidewinder';
import { MazeStrategyBinaryTree } from './MazeStrategyBinaryTree';
import { MazeStrategyKruskal } from './MazeStrategyKruskal';
import { MazeStrategyAldousBroder } from './MazeStrategyAldousBroder';
import { MazeStrategyRecursiveDivision } from './MazeStrategyRecursiveDivision';

export type MazeAlgorithm =
	| 'recursive-backtracker'
	| 'prims'
	| 'hunt-and-kill'
	| 'wilson'
	| 'eller'
	| 'sidewinder'
	| 'binary-tree'
	| 'kruskal'
	| 'aldous-broder'
	| 'recursive-division';

export interface AlgorithmMetadata {
	name: string;
	complexity: string;
	description: string;
}

export class MazeFactory {
	static readonly algorithms: Record<MazeAlgorithm, AlgorithmMetadata> = {
		'recursive-backtracker': {
			name: 'Recursive Backtracker',
			complexity: 'O(n)',
			description:
				'Uses depth-first search with backtracking to carve paths. Starts at a cell, randomly moves to unvisited neighbors while keeping track of its path. When stuck, backtracks until finding a cell with unvisited neighbors.'
		},
		prims: {
			name: "Prim's Algorithm",
			complexity: 'O(n log n)',
			description:
				"Builds maze like a growing tree. Starts with a cell, adds walls to a list, randomly picks and removes walls to connect cells. New cells' walls are added to the list. Creates a minimum spanning tree pattern."
		},
		'hunt-and-kill': {
			name: 'Hunt and Kill',
			complexity: 'O(n²)',
			description:
				'Random walk until stuck, then systematically "hunts" for an unvisited cell adjacent to the visited path. When found, connects it and resumes random walk. Creates a mix of straight passages and twisty sections.'
		},
		wilson: {
			name: "Wilson's Algorithm",
			complexity: 'O(n²)',
			description:
				'Performs loop-erased random walks to build the maze. Starts from random cells, walks randomly until hitting visited cells, then erases loops from the path. Creates perfectly uniform random mazes without bias.'
		},
		eller: {
			name: "Eller's Algorithm",
			complexity: 'O(n)',
			description:
				'Generates maze one row at a time using disjoint sets. Each row is partially connected horizontally, then vertically to the next row. Perfect for infinite mazes as it only needs to store one row in memory.'
		},
		sidewinder: {
			name: 'Sidewinder',
			complexity: 'O(n)',
			description:
				'Processes maze row by row. For each cell, randomly decides to either connect east or carve a passage north from a random cell in the current run. Creates a distinctive pattern with perfect top row.'
		},
		'binary-tree': {
			name: 'Binary Tree',
			complexity: 'O(n)',
			description:
				'For each cell, randomly decides to carve a passage either north or east. Simple but creates a strong diagonal bias and perfect passages along north and east edges. All dead ends point southwest.'
		},
		kruskal: {
			name: "Kruskal's Algorithm",
			complexity: 'O(n log n)',
			description:
				'Treats cells as disjoint sets, randomly removes walls between cells in different sets and merges their sets. Continues until all cells are in the same set. Creates unbiased mazes with a more organic feel.'
		},
		'aldous-broder': {
			name: 'Aldous-Broder Algorithm',
			complexity: 'O(n³)',
			description:
				'Performs a random walk through the grid. When visiting an unvisited cell, carves a passage from the previous cell. Creates unbiased mazes but can be very inefficient.'
		},
		'recursive-division': {
			name: 'Recursive Division',
			complexity: 'O(n log n)',
			description:
				'Recursively divides the maze into chambers, adding passages through the dividing walls. Creates mazes with long straight passages and a more geometric pattern.'
		}
	};

	static createMaze(
		algorithm: MazeAlgorithm,
		width: number,
		height: number,
		cellSize: number
	): MazeBase {
		switch (algorithm) {
			case 'recursive-backtracker':
				return new MazeStrategyRecursiveBacktracker(width, height, cellSize);
			case 'prims':
				return new MazeStrategyPrims(width, height, cellSize);
			case 'hunt-and-kill':
				return new MazeStrategyHuntAndKill(width, height, cellSize);
			case 'wilson':
				return new MazeStrategyWilson(width, height, cellSize);
			case 'eller':
				return new MazeStrategyEller(width, height, cellSize);
			case 'sidewinder':
				return new MazeStrategySidewinder(width, height, cellSize);
			case 'binary-tree':
				return new MazeStrategyBinaryTree(width, height, cellSize);
			case 'kruskal':
				return new MazeStrategyKruskal(width, height, cellSize);
			case 'aldous-broder':
				return new MazeStrategyAldousBroder(width, height, cellSize);
			case 'recursive-division':
				return new MazeStrategyRecursiveDivision(width, height, cellSize);
			default:
				throw new Error(`Unknown maze algorithm: ${algorithm}`);
		}
	}

	static getRandomAlgorithm(): MazeAlgorithm {
		const algorithms = Object.keys(this.algorithms) as MazeAlgorithm[];
		return algorithms[Math.floor(Math.random() * algorithms.length)];
	}

	static getAlgorithmMetadata(algorithm: MazeAlgorithm): AlgorithmMetadata {
		return this.algorithms[algorithm];
	}
}
