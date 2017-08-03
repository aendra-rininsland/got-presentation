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
	const wrapper = d3.select(selector);
	const svg = wrapper.append('svg');
	svg.attr('width', opts.width || wrapper.node().clientWidth);
	svg.attr('height', opts.height || wrapper.node().clientHeight);
	const container = svg.append('g');
	const margin = opts.margin || {};
	container.attr('transform', `translate(${margin.left || 0}, ${margin.top || 0})`);
	chart.call({wrapper, svg, container}, opts, d3.scaleOrdinal(d3.schemeCategory20));
}

/**
 * Helper function for displaying tooltips
 * @param  {Function}   text  Text node accessor function
 * @param  {SVGElement} chart Chart container element
 * @return {Function}         Tooltip layout
 */
export function tooltip(text, chart) {

	return selection => {
		function mouseover(d) {
			const path = d3.select(this);
			path.classed('highlighted', true);

			const mouse = d3.mouse(chart.node());
			const tool = chart.append('g')
			.attr('id', 'tooltip')
			.attr('transform', `translate(${mouse[0] + 5},${mouse[1] + 10})`);

			const textNode = tool.append('text')
			.text(text(d))
			.attr('fill', 'black')
			.node();

			tool.append('rect')
			.attr('height', textNode.getBBox().height)
			.attr('width', textNode.getBBox().width + 6)
			.style('fill', 'rgba(255, 255, 255, 0.6)')
			.attr('transform', `translate(-3, -23)`);

			tool.select('text')
			.remove();

			tool.append('text').text(text(d));
		}

		function mousemove() {
			const mouse = d3.mouse(chart.node());
			d3.select('#tooltip')
			.attr('transform', `translate(${mouse[0] + 15},${mouse[1] + 20})`);
		}

		function mouseout() {
			const path = d3.select(this);
			path.classed('highlighted', false);
			d3.select('#tooltip').remove();
		}

		selection.on('mouseover.tooltip', mouseover)
		.on('mousemove.tooltip', mousemove)
		.on('mouseout.tooltip', mouseout);
	};
}
