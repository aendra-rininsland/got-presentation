/**
* A Song Of Ice and Data and Stuff Chart code
*/

import * as d3 from 'd3';

// First we create a factory function to generate all the boilerplate we'll need to keep DRY
// in our examples.

export function chartFactory(selector, chart, opts = {}) {
	const wrapper = d3.select(selector);
	const svg = wrapper.append('svg');
	svg.attr('width', opts.width || wrapper.node().clientWidth);
	svg.attr('height', opts.height || wrapper.node().clientHeight);
	const container = svg.append('g');
	const margin = opts.margin || {};
	container.attr('transform', `translate(${margin.left || 0}, ${margin.top || 0})`);

	chart.call(svg.node(), opts);
}

export async function pie(opts) {
	const data = await (await fetch('../data/AnApiOfIceAndFire.characters.json')).json();
	const byGender = data.reduce(
		(col, cur) => (col[cur.IsFemale ? 'female' : 'male']++, col),
		{male: 0, female: 0}
	);
	const pie = d3.pie().value(d => d[1]);
	const arc = d3.arc()
		.outerRadius(this.clientWidth / 6)
		.innerRadius(this.clientWidth / 6.5);

	const chart = d3.select('g', this).append('g')
		.classed('pie', true)
		.attr('transform', `translate(${this.clientWidth / 2}, ${this.clientHeight / 2})`);

	const slices = chart.append('g')
		.attr('class', 'pie')
		.selectAll('.arc')
		.data(pie(Object.entries(byGender)).sort((a, b) => b.data[1] - a.data[1]))
		.enter()
		.append('path')
		.attr('d', arc)
		.classed('arc', true)
		.attr('fill', d => d.data[0] === 'male' ? 'blue' : 'pink');
}
