/**
* Shared functionality
*/

import * as d3 from 'd3';

// First we create a factory function to generate all the boilerplate we'll need to keep DRY
// in our examples.

/**
 * Factory function for scaffolding charts
 * @param  {String} selector  CSS selector for parent container
 * @param  {function} chart   Chart function
 * @param  {Object} [opts={}] Options
 * @return {void}
 */
export default function chartFactory(selector, chart, opts = {}) {
	const wrapper = d3.select(selector); // Create a selection using the selector string
	const svg = wrapper.append('svg'); // Append a SVG element...
	svg.attr('width', opts.width || wrapper.node().clientWidth); // ...and set its width/height via
	svg.attr('height', opts.height || wrapper.node().clientHeight); // ...the wrapper's client properties
	const container = svg.append('g'); // Add a group container
	const margin = opts.margin || {}; // Get margins from function arg
	container.attr('transform', `translate(${margin.left || 0}, ${margin.top || 0})`); // Translate to margins
	chart.call({wrapper, svg, container}, opts, d3.scaleOrdinal(d3.schemeCategory20)); // Instantiate chart w/ color scale
}

/**
 * Helper function for displaying tooltips
 * @param  {Function}   text  Text node accessor function
 * @param  {SVGElement} chart Chart container element
 * @return {Function}         Tooltip layout
 */
export function tooltip(text, chart) {
	// Return a function that gets called on every element of the selection
	return selection => {
		/**
		 * Event callback for hover state
		 * @param  {Object|Array} d Datum for the item being hovered
		 * @return {void}
		 */
		function mouseover(d) {
			const path = d3.select(this);
			path.classed('highlighted', true); // Add highlighted class to current hovered element

			const mouse = d3.mouse(chart.node()); // Get the mouse coords aligned with target chart element
			const tool = chart.append('g') // Append a group...
			.attr('id', 'tooltip')
			.attr('transform', `translate(${mouse[0] + 5},${mouse[1] + 10})`); // ... and translate to mouse coords

			const textNode = tool.append('text') // Add the tooltip text to the group
			.text(text(d))
			.attr('fill', 'black')
			.node(); // Get its node from selection because we need its bounding box below.

			tool.append('rect')
			.attr('height', textNode.getBBox().height) // Set background to the dimensions of text box
			.attr('width', textNode.getBBox().width + 6) // The six here is pretty arbitrary
			.style('fill', 'rgba(255, 255, 255, 0.6)')
			.attr('transform', `translate(-3, -23)`) // These are also arbitrary; I had to play with them to get text centered.
			.lower(); // Move this behind the text — SVG stacking order is important!
		}

		/**
		 * Move tooltip to new mouse position
		 * @return {void}
		 */
		function mousemove() {
			const mouse = d3.mouse(chart.node());
			d3.select('#tooltip')
			.attr('transform', `translate(${mouse[0] + 15},${mouse[1] + 20})`);
		}

		/**
		 * Remove tooltip when no longer hovering stuff
		 * @return {void}
		 */
		function mouseout() {
			const path = d3.select(this);
			path.classed('highlighted', false);
			d3.select('#tooltip').remove();
		}

		// Set up the above callbacks as mouse events
		selection.on('mouseover.tooltip', mouseover)
		.on('mousemove.tooltip', mousemove)
		.on('mouseout.tooltip', mouseout);
	};
}
