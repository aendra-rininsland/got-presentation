import bespoke from 'bespoke';
import bespokeKeys from 'bespoke-keys';
import bespokeBullets from 'bespoke-bullets';
import bespokeScale from 'bespoke-scale';
import bespokeProgress from 'bespoke-progress';
import bespokeHash from 'bespoke-hash';
import bespokeNebula from 'bespoke-theme-nebula';

const deck = bespoke.from('#presentation', [
	bespokeKeys(),
	bespokeBullets(),
	bespokeScale(),
	bespokeProgress(),
	bespokeHash(),
	bespokeNebula()
]);
