<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { MazeFactory, type MazeAlgorithm } from '$lib/mazes/MazeFactory';
	import type { MazeBase } from '$lib/mazes/MazeBase';
	import { colors } from '$lib/theme/colors';

	let canvas: HTMLCanvasElement;
	let currentMaze: MazeBase;
	let currentAlgorithm: MazeAlgorithm;
	let ctx: CanvasRenderingContext2D;
	let showMetadata = false;
	let isGenerating = false;
	let generationPromise: Promise<void> | null = null;
	let resizeTimeout: number | null = null;

	function resizeCanvas() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}

	function debounce(func: Function, wait: number) {
		return (...args: any[]) => {
			if (resizeTimeout) {
				window.clearTimeout(resizeTimeout);
			}
			resizeTimeout = window.setTimeout(() => {
				func.apply(null, args);
				resizeTimeout = null;
			}, wait);
		};
	}

	async function cancelCurrentGeneration() {
		if (isGenerating && currentMaze) {
			currentMaze.cancel();
			if (generationPromise) {
				try {
					await generationPromise;
				} catch (error) {
					if (error.message !== 'Generation cancelled') {
						console.error('Error during cancellation:', error);
					}
				}
			}
		}
	}

	async function generateNewMaze() {
		// Cancel any existing generation
		await cancelCurrentGeneration();

		isGenerating = true;
		const cellSize = 40;
		const width = Math.floor(window.innerWidth / cellSize);
		const height = Math.floor(window.innerHeight / cellSize);

		currentAlgorithm = MazeFactory.getRandomAlgorithm();
		currentMaze = MazeFactory.createMaze(currentAlgorithm, width, height, cellSize);

		// Clear canvas
		ctx.fillStyle = colors.background.primary;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Center the maze
		const mazeWidth = width * cellSize;
		const mazeHeight = height * cellSize;
		const offsetX = (canvas.width - mazeWidth) / 2;
		const offsetY = (canvas.height - mazeHeight) / 2;

		ctx.save();
		ctx.translate(offsetX, offsetY);

		// Set the context and start generation
		currentMaze.setContext(ctx);
		try {
			generationPromise = currentMaze.generate();
			await generationPromise;
		} catch (error) {
			if (error.message !== 'Generation cancelled') {
				console.error('Error generating maze:', error);
			}
		} finally {
			isGenerating = false;
			generationPromise = null;
			ctx.restore();
		}
	}

	async function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			await generateNewMaze();
		}
	}

	async function handleResize() {
		resizeCanvas();
		await generateNewMaze();
	}

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		resizeCanvas();
		generateNewMaze();

		// Add event listeners with debounced resize handler
		const debouncedResize = debounce(handleResize, 250);
		window.addEventListener('resize', debouncedResize);
		window.addEventListener('keydown', handleKeydown);

		// Cleanup function
		return () => {
			cancelCurrentGeneration();
			window.removeEventListener('resize', debouncedResize);
			window.removeEventListener('keydown', handleKeydown);
			if (resizeTimeout) {
				window.clearTimeout(resizeTimeout);
			}
		};
	});
</script>

<svelte:head>
	<title>Mazes</title>
</svelte:head>

<div
	style="
        --background-primary: {colors.background.primary};
        --background-overlay: {colors.background.overlay};
        --ui-primary: {colors.ui.primary};
        --ui-hover: {colors.ui.hover};
        --ui-text-primary: {colors.ui.text.primary};
        --ui-text-secondary: {colors.ui.text.secondary};
        --ui-text-muted: {colors.ui.text.muted};
        --ui-text-accent-blue: {colors.ui.text.accent.blue};
        --ui-text-accent-red: {colors.ui.text.accent.red};
        --ui-border: {colors.ui.border};
    "
>
	<canvas 
		bind:this={canvas} 
		style="display: block; background-color: {colors.background.primary};"
		on:click={generateNewMaze}
	>
	</canvas>

	<button
		class="info-button"
		aria-label="Show metadata"
		on:mouseenter={() => (showMetadata = true)}
		on:mouseleave={() => (showMetadata = false)}
	>
		i
		{#if showMetadata}
			<div class="metadata" transition:fade>
				<h3>Maze Information</h3>
				{#if currentAlgorithm}
					{@const metadata = MazeFactory.getAlgorithmMetadata(currentAlgorithm)}
					<p class="algorithm-name">{metadata.name}</p>
					<p class="complexity">Complexity: {metadata.complexity}</p>
					<p class="description">{metadata.description}</p>
				{/if}
				<p class="controls">Click anywhere or press ESC to generate new mazes</p>
			</div>
		{/if}
	</button>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
		background-color: var(--background-primary);
	}

	canvas {
		width: 100vw;
		height: 100vh;
	}

	.info-button {
		position: fixed;
		top: 20px;
		right: 20px;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--ui-primary);
		border: 2px solid var(--ui-primary);
		color: var(--background-primary);
		font-family: 'Times New Roman', serif;
		font-style: italic;
		font-size: 18px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
	}

	.info-button:hover {
		background: var(--ui-hover);
		border-color: var(--ui-hover);
	}

	.metadata {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 8px;
		background: var(--background-overlay);
		color: var(--ui-text-primary);
		padding: 20px;
		border-radius: 8px;
		font-family: 'Arial', sans-serif;
		min-width: 300px;
		text-align: left;
		font-style: normal;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
	}

	.metadata h3 {
		margin: 0 0 15px 0;
		font-size: 20px;
		color: var(--ui-text-primary);
	}

	.metadata p {
		margin: 8px 0;
		font-size: 14px;
		line-height: 1.5;
	}

	.algorithm-name {
		font-size: 16px;
		font-weight: bold;
		color: var(--ui-text-accent-blue);
	}

	.complexity {
		color: var(--ui-text-accent-red);
	}

	.description {
		color: var(--ui-text-secondary);
	}

	.controls {
		margin-top: 15px;
		padding-top: 10px;
		border-top: 1px solid var(--ui-border);
		color: var(--ui-text-muted);
	}
</style>
