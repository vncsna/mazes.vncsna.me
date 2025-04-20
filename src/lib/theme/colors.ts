export const colors = {
	// Background colors
	background: {
		primary: '#FFFFFF', // White main background for light theme
		overlay: 'rgba(255, 255, 255, 0.95)' // Light overlay for contrast
	},

	// Maze colors
	maze: {
		walls: '#E2E8F0', // Light gray walls
		currentCell: '#C084FC', // Light purple for current cell
		visitedCell: '#93C5FD' // Light blue for visited cells
	},

	// UI colors
	ui: {
		primary: '#1E293B', // Dark text/UI elements for contrast
		hover: '#F1F5F9', // Light gray hover state
		text: {
			primary: '#1E293B', // Dark gray for primary text
			secondary: '#64748B', // Medium gray for secondary text
			muted: '#94A3B8', // Lighter gray for muted text
			accent: {
				blue: '#3B82F6', // Bright blue accent
				red: '#EF4444' // Bright red accent
			}
		},
		border: 'rgba(30, 41, 59, 0.1)' // Subtle dark border
	}
} as const;
