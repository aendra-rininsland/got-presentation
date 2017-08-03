const {readFileSync, writeFileSync} = require('fs');

const lineageData = JSON.parse(readFileSync('./got-lineages.json'));
const timeData = JSON.parse(readFileSync('./screentimes.json'));

const output = lineageData.map(d => {
	try {
		let time = timeData.filter(e => e.name.split(' ').shift() === d.name.split(' ').shift());
		if (time.length > 1) {
			time = timeData.filter(e => e.name === d.name);
		}

		d.screentime = time[0].screentime;
		d.episodes = time[0].episodes;

		return d;
	} catch (err) {
    // Console.log(d.itemLabel);
    // console.error(e);
		d.screentime = 0;
		d.episodes = 0;

		return d;
	}
});// .filter(i => i.screentime > 0);

writeFileSync('./lineages-screentimes.json', JSON.stringify(output), {encoding: 'utf8'});
