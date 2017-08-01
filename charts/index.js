/**
 * A Song Of Ice and Data and Stuff Chart code
 */

import * as d3 from 'd3';

// First we create a factory function to generate all the boilerplate we'll need to keep DRY
// in our examples.

export function chartFactory(selector, chart, opts = {}) {
	const wrapper = d3.select(selector);
	const svg = wrapper.append('svg');
	svg.attr('width', opts.width || wrapper.innerWidth);
	svg.attr('height', opts.height || wrapper.innerHeight);
	const container = svg.append('g');
	const margin = opts.margin || {};
	container.attr('transform', `translate(${margin.left || 0}, ${margin.top || 0})`);

	chart.call(container, opts);
}
