/**
 * Converts Network Of Thrones CSV files to JSON
 */

const d3 = require('d3');
const {readFileSync, writeFileSync} = require('fs');

const nodes = new Promise((res, rej) => {
	const nodeString = readFileSync('./asoiaf-all-nodes.csv', 'ascii');
	res(d3.csvParse(nodeString));
});

const edges = new Promise((res, rej) => {
	const edgeString = readFileSync('./asoiaf-all-edges.csv', 'ascii');
	res(d3.csvParse(edgeString)
		.map(d => ({
			source: d.Source,
			target: d.Target,
			type: d.type,
			id: d.id,
			weight: Number(d.weight)
		})));
});

Promise.all([nodes, edges]).then(([nodes, edges]) => {
	writeFileSync('./network-of-thrones.json', JSON.stringify({nodes, edges}), 'utf-8');
});
