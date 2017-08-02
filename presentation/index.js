import bespoke from 'bespoke';
import bespokeKeys from 'bespoke-keys';
import bespokeBullets from 'bespoke-bullets';
import bespokeScale from 'bespoke-scale';
import bespokeProgress from 'bespoke-progress';
import bespokeHash from 'bespoke-hash';
import bespokeNebula from 'bespoke-theme-nebula';
import * as charts from '../charts';
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

deck.on('activate', e => {
	if (e.slide.id.indexOf('demo-') !== -1) {
		charts.chartFactory(`#${e.slide.id}`, charts[e.slide.id.split('-')[1]]);
	}
});

deck.on('deactivate', () => {
	[...document.querySelectorAll('svg')].forEach(chart => chart.remove());
});
