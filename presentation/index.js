/**
 * Presentation code
 * You're probably looking for charts/index.js, this file is pretty boring.
 */

import * as d3 from 'd3';
import bespoke from 'bespoke';
import bespokeKeys from 'bespoke-keys';
import bespokeBullets from 'bespoke-bullets';
import bespokeScale from 'bespoke-scale';
import bespokeProgress from 'bespoke-progress';
import bespokeHash from 'bespoke-hash';
import bespokeNebula from 'bespoke-theme-nebula';
import * as charts from '../charts';
import chartFactory from '../charts/common';

/* eslint-disable import/no-unassigned-import */
import 'prismjs/themes/prism-funky.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import 'prismjs/plugins/line-highlight/prism-line-highlight.css';
import 'prismjs';
import './index.css';
/* eslint-enable */

const deck = bespoke.from('#presentation', [
	bespokeKeys(),
	bespokeBullets(),
	bespokeScale(),
	bespokeProgress(),
	bespokeHash(),
	bespokeNebula()
]);

// The below instantiates and destroys the charts when navigated to and from, respectively.
// Each "demo" slide has ID #demo-chartName, with the container having ID #chart-chartName.
// "chartName" corresponds to the function defined in charts/index.js.

deck.on('activate', e => {
	if (e.slide.id.indexOf('demo-') !== -1) {
		const [, type] = e.slide.id.split('-');
		chartFactory(`#chart-${type}`, charts[type], d3.select(`#chart-${type}`).node().dataset);
	}
});

deck.on('deactivate', () => {
	[...document.querySelectorAll('svg')].forEach(chart => chart.remove());
});
