/**
* A Song Of Ice and Data and Stuff Chart code
*/

import * as d3 from 'd3';
import {tooltip} from './common';

/**
 * Pie chart!
 * @param  {Object} opts  Options object
 * @param  {d3Scale} color D3 color Scale
 * @return {void}
 */
export async function pie(opts, color) {
	// Data
	const data = await (await fetch('../data/AnApiOfIceAndFire.json')).json();

	// The above is equivalent to:
	// fetch('../data/AnApiOfIceAndFire.json')
	// .then(res => res.json())
	// .then(data => {
	//     // Here's where we'd do stuff with `data`
	// })

	const byGender = data.reduce(
		(col, cur) => (col[cur.IsFemale ? 'female' : 'male']++, col),
		{male: 0, female: 0}
	); // Creates object of format `{male: x, female: y}`

	// Initialise generators
	const pie = d3.pie().value(d => d[1]);
	const pieData = pie(Object.entries(byGender))
	.sort((a, b) => b.data[1] - a.data[1]);
	color.domain(pieData.map(d => d.data[0]));

	// Arc generators for the slices...
	const arc = d3.arc()
	.outerRadius(this.svg.node().clientWidth / 6) // These numbers are arbitrary and chosen for aesthetics
	.innerRadius(this.svg.node().clientWidth / 6.5);

	const chart = this.container.classed('pie', true)
	.attr('transform',
	`translate(${this.svg.node().clientWidth / 2}, ${this.svg.node().clientHeight / 2})`);

	// Draw
	const slices = chart.selectAll('.arc')
	.data(pieData)
	.enter()
	.append('path')
	.attr('d', arc) // We pass our data to our arc generator, which gives us back a long unintelligible string
	.classed('arc', true)
	.attr('fill', d => d.data[0] === 'male' ? 'blue' : 'pink'); // Booo stereotypical gendered colours

	slices.call(tooltip(d => d.data[0], this.container)); // Instantiates tooltip factory on each slice
}

/**
 * Streamgraph!
 * @param  {Object} [opts={wiggle: true}]     Options
 * @param  {d3Scale} color                    Colour scale
 * @return {void}
 */
export async function stack(opts = {wiggle: true}, color) {
	// Data and initial setup...
	const {data} = await (await fetch('data/deaths-by-season.json')).json();
	const episodesPerSeason = 10;
	const totalSeasons = 6;
	// We get the width and height from the SVG node, where they're defined.
	const {clientHeight: height, clientWidth: width} = this.svg.node();

	// In the following, we effectively create an array of episodes set at the child of each season.
	// D3 nest is confusing. Here's a good tutorial: http://learnjsdata.com/group_data.html
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

	// Instantiates our stack generator
	const stack = d3.stack()
	.keys(d3.range(1, totalSeasons + 1).map(key => `season-${key}`));

	if (['true', true].indexOf(opts.wiggle) > -1) {
		stack.offset(d3.stackOffsetWiggle); // Wiggle offset makes a stacked area into a streamgraph
	}

	// X-axis is the episode number
	const x = d3.scaleLinear()
	.domain([1, episodesPerSeason])
	.range([0, width - 20]);

	// Y-axis is the season
	const y = d3.scaleLinear()
	.domain([
		d3.min(stack(seasons), d => d3.min(d, e => e[0])),
		d3.max(stack(seasons), d => d3.max(d, e => e[1]))
	])
	.range([height, 0]);

	// Create our area generator
	const area = d3.area()
	.x(d => x(d.data.episode))
	.y0(d => y(d[0]))
	.y1(d => y(d[1]))
	.curve(d3.curveBasis); // Make the interpolation nice 'n' curvy

	// Draw them into the chart
	const streams = this.container.append('g')
	.attr('class', 'streams')
	.selectAll('path')
	.data(stack(seasons))
	.enter()
	.append('path')
	.attr('d', area)
	.style('fill', (d, i) => color(i)); // Color using the scale provided by function arg

	streams.call(tooltip(d => `Season ${d.index + 1}`, this.container));
}

/**
 * Tidytrees!
 * @param  {Object} opts   Options
 * @param  {d3Scale} color D3 colour scale
 * @return {void}
 */
export async function tree(opts, color) {
	// Get the data!
	const data = (await (await fetch('data/got-lineages.json')).json());
	data.push({name: 'unknown', father: ''}); // Adds root node

	// Set up the width and height!
	const {clientHeight: height, clientWidth: width} = this.svg.node();
	const chart = this.container;

	// Create a stratify generator, using the "father" attribute as the parent ID
	const stratify = d3.stratify()
		.parentId(d => d.father)
		.id(d => d.name); // Use the name attribute as each node's ID

	const root = stratify(data); // Using the stratify generator, turn data into a tree

	const layout = d3.tree() // Instantiate the dendrograph layout!
		.size([width, height - 20]);

	// Creates a line generator for the links. I was complaining that there wasn't a good way of
	// doing this and it required some voodoo; it seems they've recently added d3.linkVertical!
	const line = d3.linkVertical()
		.x(d => d.x)
		.y(d => d.y);

	// Calculate the link between each node
	const links = layout(root)
		.links();

	// Draw all the links!
	chart.selectAll('.link')
		.data(links)
		.enter()
			.append('path')
			.classed('link', true)
			.attr('fill', 'none')
			.attr('stroke', d => color(d.source.data.house))
			.attr('d', line);

	// Draw all the nodes!
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

	// Tooltip time!
	node.call(tooltip(d => d.id, this.container));
}

/**
 * Force-directed network diagram!
 * @param  {Object} opts  Options!
 * @param  {d3Scale} color D3 colour scale!
 * @return {void}
 */
export async function force(opts, color) {
	// Get all the data...
	const data = (await (await fetch('data/network-of-thrones.json')).json());
	const {clientHeight: height, clientWidth: width} = this.svg.node();

	// Draw a bunch of links!
	const link = this.container.append('g').attr('class', 'links')
		.selectAll('line')
		.data(data.edges)
		.enter()
		.append('line')
		.attr('stroke', d => color(d.Source))
		.attr('stroke-width', d => Math.sqrt(Number(d.weight)));

	// Create a scale for drawing node radii
	const radius = d3.scaleLinear()
		.domain(d3.extent(data.nodes, d => Number(d.pagerank))).range([4, 20]);

	// Draw all the nodes!
	const node = this.container.append('g').attr('class', 'nodes')
		.selectAll('circle')
		.data(data.nodes)
		.enter()
		.append('circle')
		.attr('r', d => radius(Number(d.pagerank))) // Size based on pagerank value
		.attr('fill', d => color(d.modularity_class)) // Fill based on community
		.call(d3.drag() // Set up mouse events for node click/drag
			.on('start', dragstart)
			.on('drag', dragging)
			.on('end', dragend));

	// Here's where it's cool. Create a force simulation to arrange all the links/nodes.
	const padding = 2;
	const sim = d3.forceSimulation()
		.nodes(data.nodes)
		// This force causes nodes to push other nodes in their proximity away
		.force('collide', d3.forceCollide(d => radius(Number(d.pagerank)) + padding))
		// This pushes nodes towards the center of the chart
		.force('center', d3.forceCenter(width / 2, height / 2))
		// This causes the links to attempt to keep nodes a distance of 10 away from each other.
		.force('link', d3.forceLink(data.edges).id(d => d.id).distance(10))
		.on('tick', ticked); // Run the `ticked` function on every simulation tick

	// Enable tooltips
	node.call(tooltip(d => d.id, this.container));

	// This runs every time the simulation recalculates positions, on the "tick" event
	// All we're doing is setting the positioning properties to the new positions.
	function ticked() {
		link.attr('x1', d => d.source.x)
			.attr('y1', d => d.source.y)
			.attr('x2', d => d.target.x)
			.attr('y2', d => d.target.y);

		node.attr('cx', d => d.x)
			.attr('cy', d => d.y);
	}

	// If you drag one, it restarts the sim and updates dragged node position
	function dragstart(d) {
		if (!d3.event.active) {
			sim.alphaTarget(0.3).restart();
		}
		d.fx = d.x;
		d.fy = d.y;
	}

	// Sets new position based on where the mouse is dragging the node to
	function dragging(d) {
		d.fx = d3.event.x;
		d.fy = d3.event.y;
	}

	// Resets position and sim when no longer dragging
	function dragend(d) {
		if (!d3.event.active) {
			sim.alphaTarget(0);
		}
		d.fx = null;
		d.fy = null;
	}
}

/**
 * Treemap!
 * @param  {Object} opts  Options!
 * @param  {d3Scale} color D3 colour scaleOrdinal
 * @return {void}
 */
export async function treemap(opts, color) {
	// Get the data...
	const data = await (await fetch('data/lineages-screentimes.json')).json();
	data.push({name: 'unknown', father: ''}); // Adds root node

	const {clientHeight: height, clientWidth: width} = this.svg.node();

	// Strat dat!
	const stratify = d3.stratify()
		.parentId(d => d.father)
		.id(d => d.name);

	const root = stratify(data)
		.sum(d => d.screentime) // Size the boxes based on the sum of character and his descendants' screentime
		.sort((a, b) => b.height - a.height || b.value - a.value);

	const cellPadding = 10; // Tweaking this value is fun

	// Instantiate the treemap layout
	const layout = d3.treemap()
		.size([
			width - 100,
			height
		])
		.padding(cellPadding);

	// Mutate data based on layout calculations.
	// This is gross and totally not functional programming.
	layout(root);

	// Place nodes into groups
	const nodes = this.container.selectAll('.node')
		.data(root.descendants().slice(1)) // We trim off the root node we added at the start.
		.enter()
		.append('g')
		.attr('class', 'node');

	// Actually draw the nodes
	nodes.append('rect')
		.attr('x', d => d.x0)
		.attr('y', d => d.y0)
		.attr('width', d => d.x1 - d.x0)
		.attr('height', d => d.y1 - d.y0)
		.attr('stroke', 'black')
		.attr('fill', d => color(d.data.house));

	// T-t-t-t-t-tooooooltiiiiiiip!
	nodes.call(tooltip(d => d.id, this.svg));
}

/**
 * Bonus: Pack charts
 * @param  {Object} opts  Options
 * @param  {d3Scale} color D3 colour scaleOrdinal
 * @return {void}          ...If you stare into the `void`, you won't return.
 */
export async function pack(opts, color) {
	// Same ol' hierarchical data construction as before
	const data = await (await fetch('data/lineages-screentimes.json')).json();
	data.push({name: 'unknown', father: ''}); // Adds root node

	const {clientHeight: height, clientWidth: width} = this.svg.node();

	// 🎶 It's right outside your door / now stratify! 🎶
	const stratify = d3.stratify()
		.parentId(d => d.father)
		.id(d => d.name);

	const root = stratify(data)
		.sum(d => d.screentime)
		.sort((a, b) => b.value - a.value);

	// Instantiate the pack layout. Kind of similar to treemap so far, huh?
	const layout = d3.pack()
		.size([
			width - 100,
			height
		]);

	// Remember this icky, side-effect-y thing from treemap? It's here too!
	layout(root);

	// Draw the nodes again!
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

	// 🎶 Take me down to tooltip city / where the grass is green and the text so spiffy! 🎶
	nodes.call(tooltip(d => d.id, this.container));
}
