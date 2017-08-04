const fs = require('fs');
var edges = require('./shiring-got-edges.json');
var nodes = require('./shiring-got-nodes.json');

nodes.forEach(d => {
	const father = edges.find(e => e.target === d.name && e.type === 'father');
	const mother = edges.find(e => e.target === d.name && e.type === 'mother');

	d.father = father ? father.source : 'unknown';
	d.mother = mother ? mother.source : 'unknown';
});

fs.writeFileSync('./got-lineages.json', JSON.stringify(nodes), 'utf-8');