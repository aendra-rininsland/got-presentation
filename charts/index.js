/**
* A Song Of Ice and Data and Stuff Chart code
*/

import * as d3 from 'd3';
import {tooltip} from './common';

export async function pie(opts, color) {
	// Data
	const data = await (await fetch('data/AnApiOfIceAndFire.json')).json();
	const byGender = data.reduce(
		(col, cur) => (col[cur.IsFemale ? 'female' : 'male']++, col),
		{male: 0, female: 0}
	);

	// Initialise generators
	const pie = d3.pie().value(d => d[1]);
	const pieData = pie(Object.entries(byGender))
	.sort((a, b) => b.data[1] - a.data[1]);
	color.domain(pieData.map(d => d.data[0]));

	const arc = d3.arc()
	.outerRadius(this.svg.node().clientWidth / 6)
	.innerRadius(this.svg.node().clientWidth / 6.5);

	const chart = this.container.classed('pie', true)
	.attr('transform',
	`translate(${this.svg.node().clientWidth / 2}, ${this.svg.node().clientHeight / 2})`);

	// Draw
	const slices = chart.selectAll('.arc')
	.data(pieData)
	.enter()
	.append('path')
	.attr('d', arc)
	.classed('arc', true)
	.attr('fill', d => d.data[0] === 'male' ? 'blue' : 'pink');

	slices.call(tooltip(d => d.data[0], this.container));
}

export async function stack(opts = {wiggle: true}, color) {
	const {data} = await (await fetch('data/deaths-by-season.json')).json();
	const episodesPerSeason = 10;
	const totalSeasons = 6;
	const {clientHeight: height, clientWidth: width} = this.svg.node();

	const seasons = d3.nest()
	.key(d => d.death.episode)
	.key(d => d.death.season)
	.entries(data.filter(d => !d.death.isFlashback))
	.map(v => {
		return d3.range(1, totalSeasons + 1).reduce((item, episodeNumber) => {
			const deaths = v.values.filter(d => Number(d.key) === episodeNumber).shift() || 0;
			item[`season-${episodeNumber}`] = deaths ? deaths.values.length : 0;
			return item;
		}, {episode: v.key});
	})
	.sort((a, b) => Number(a.episode) - Number(b.episode));

	const stack = d3.stack()
	.keys(d3.range(1, totalSeasons + 1).map(key => `season-${key}`));

	if (opts.wiggle === 'true') {
		stack.offset(d3.stackOffsetWiggle);
	}

	const x = d3.scaleLinear()
	.domain([1, episodesPerSeason])
	.range([0, width - 20]);

	const y = d3.scaleLinear()
	.domain([
		d3.min(stack(seasons), d => d3.min(d, e => e[0])),
		d3.max(stack(seasons), d => d3.max(d, e => e[1]))
	])
	.range([height, 0]);

	const area = d3.area()
	.x(d => x(d.data.episode))
	.y0(d => y(d[0]))
	.y1(d => y(d[1]))
	.curve(d3.curveBasis);

	const streams = this.container.append('g')
	.attr('class', 'streams')
	.selectAll('path')
	.data(stack(seasons))
	.enter()
	.append('path')
	.attr('d', area)
	.style('fill', (d, i) => color(i));

	streams.call(tooltip(d => `Season ${d.index + 1}`, this.container));
}

export async function tree(opts, color) {
	const data = (await (await fetch('data/got-lineages.json')).json());
	data.push({name: 'unknown', father: ''}); // Adds root node

	const {clientHeight: height, clientWidth: width} = this.svg.node();
	const chart = this.container;

	const stratify = d3.stratify()
		.parentId(d => d.father)
		.id(d => d.name);

	const root = stratify(data);

	const layout = d3.tree()
		.size([width, height - 20]);

	const line = d3.line().curve(d3.curveBasis);

	// Links
	const links = layout(root)
		.descendants()
		.slice(1);

	chart.selectAll('.link')
		.data(links)
		.enter()
			.append('path')
			.classed('link', true)
			.attr('fill', 'none')
			.attr('stroke', d => color(d.data.house))
			.attr('d', d => line([ // This bit is admittedly kinda dumb
				[d.x, d.y],
				[d.x, (d.y + d.parent.y) / 2],
				[d.parent.x, (d.y + d.parent.y) / 2],
				[d.parent.x, d.parent.y]],
			));

	// Nodes
	const node = chart.selectAll('.node')
	.data(root.descendants())
	.enter()
	.append('circle')
	.classed('node', true)
	.attr('r', 4.5)
	.attr('fill', d => color(d.data.house))
	.attr('class', 'node')
	.attr('cx', d => d.x)
	.attr('cy', d => d.y);

	node.call(tooltip(d => d.id, this.container));
}

export async function force(opts, color) {
	const data = (await (await fetch('data/network-of-thrones.json')).json());
	const {clientHeight: height, clientWidth: width} = this.svg.node();

	const link = this.container.append('g').attr('class', 'links')
		.selectAll('line')
		.data(data.edges)
		.enter()
		.append('line')
		.attr('stroke', d => color(d.Source))
		.attr('stroke-width', d => Math.sqrt(Number(d.weight)));

	const radius = d3.scaleLinear()
		.domain(d3.extent(data.nodes, d => Number(d.pagerank))).range([4, 20]);

	const node = this.container.append('g').attr('class', 'nodes')
		.selectAll('circle')
		.data(data.nodes)
		.enter()
		.append('circle')
		.attr('r', d => radius(Number(d.pagerank)))
		.attr('fill', d => color(d.modularity_class))
		.call(d3.drag()
			.on('start', dragstart)
			.on('drag', dragging)
			.on('end', dragend));

	const padding = 2;
	const sim = d3.forceSimulation()
		.nodes(data.nodes)
		.force('collide', d3.forceCollide(d => radius(Number(d.pagerank)) + padding))
		.force('center', d3.forceCenter(width / 2, height / 2))
		.force('link', d3.forceLink(data.edges).id(d => d.id).distance(10))
		.on('tick', ticked);

	node.call(tooltip(d => d.id, this.container));

	function ticked() {
		link.attr('x1', d => d.source.x)
			.attr('y1', d => d.source.y)
			.attr('x2', d => d.target.x)
			.attr('y2', d => d.target.y);

		node.attr('cx', d => d.x)
			.attr('cy', d => d.y);
	}

	function dragstart(d) {
		if (!d3.event.active) {
			sim.alphaTarget(0.3).restart();
		}
		d.fx = d.x;
		d.fy = d.y;
	}

	function dragging(d) {
		d.fx = d3.event.x;
		d.fy = d3.event.y;
	}

	function dragend(d) {
		if (!d3.event.active) {
			sim.alphaTarget(0);
		}
		d.fx = null;
		d.fy = null;
	}
}

export async function treemap(opts, color) {
	const data = await (await fetch('data/lineages-screentimes.json')).json();
	data.push({name: 'unknown', father: ''}); // Adds root node

	const {clientHeight: height, clientWidth: width} = this.svg.node();

	const stratify = d3.stratify()
		.parentId(d => d.father)
		.id(d => d.name);

	const root = stratify(data)
		.sum(d => d.screentime)
		.sort((a, b) => b.height - a.height || b.value - a.value);

	const cellPadding = 10;

	const layout = d3.treemap()
		.size([
			width - 100,
			height
		])
		.padding(cellPadding);

	layout(root);

	const nodes = this.container.selectAll('.node')
		.data(root.descendants().slice(1))
		.enter()
		.append('g')
		.attr('class', 'node');

	nodes.append('rect')
		.attr('x', d => d.x0)
		.attr('y', d => d.y0)
		.attr('width', d => d.x1 - d.x0)
		.attr('height', d => d.y1 - d.y0)
		.attr('stroke', 'black')
		.attr('fill', d => color(d.data.house));

	nodes.call(tooltip(d => d.id, this.svg));
}

export async function pack(opts, color) {
	const data = await (await fetch('data/lineages-screentimes.json')).json();
	data.push({name: 'unknown', father: ''}); // Adds root node

	const {clientHeight: height, clientWidth: width} = this.svg.node();

	const stratify = d3.stratify()
		.parentId(d => d.father)
		.id(d => d.name);

	const root = stratify(data)
		.sum(d => d.screentime)
		.sort((a, b) => b.value - a.value);

	const layout = d3.pack()
		.size([
			width - 100,
			height
		]);

	layout(root);

	const nodes = this.container.selectAll('.node')
		.data(root.descendants().slice(1))
		.enter()
		.append('circle')
		.attr('class', 'node')
		.attr('cx', d => d.x)
		.attr('cy', d => d.y)
		.attr('r', d => d.r)
		.attr('stroke', d => d3.color(color(d.data.house)).darker())
		.attr('fill', d => color(d.data.house));

	nodes.call(tooltip(d => d.id, this.container));
}
