const natural = require('natural');
const nlp = require('compromise');
nlp.extend(require('compromise-syllables'));

// Set up libraries
const metaphone = natural.Metaphone;
const soundEx = natural.SoundEx;

// Extend String
metaphone.attach(); 
soundEx.attach();

const { COLOR_SET } = require('./constants');
const { SPLIT_TO_GRIDS, TRANSFORM_GRID, IS_PUNCTUATION_MARK } = require('./helpers');

const lyrics = `The enigma, the stigmas that the RZA and the GZA
Both lyrical prolific, fixtures of rap scriptures
Mixtures of hipsters, weed smokers, and beer drinkers
Prince and the Pauper, spiritual clear-thinkers
Cake in the oven, Superbad like McLovin
Huggin' all four boroughs, puffin' herb with my cousin
Academically speaking, rap vocabulary's weakenin'
I felt it comin' like The Weeknd when these starboys start tweakin'
Sporadic pill-poppin' of OxyContin
III-gotten sexual intercourse make shorty wop feel rotten
The travesty-tapestry of microphone mastery has been refuted
Diluted, broken down to a catastrophe
But cats still get the trophy, hit y'all with that 'Okie-dokie'
Burt Reynolds, Bandit, goddamnit
Where the fuck is Smokey Bear when you need one?
I got a light-beam gun
I'll blast a hole in your chest that you can't bleed from
But you'll die through iniquity, plus stupidity of that trickery
My verse got it hot up in here, not the humidity
You can never get rid of me, step back and consider me
Wu Killa Bee, but I'm not big on bigotry`;

/*const lyrics = `This the game that's really gonna make your path change
Looking for the exit out, we moving to a stargate
You're looking for some parking, I'll be darting in a fast lane
That's the time I'm living in, this mission is so fast-paced
Always on a next ting, it's the vision that'll get you in position
For the place you wanna live in; If you ain't got vision then you'll stay in the place you eat, sleep and shit in
So, listen, I tell it how it is, not how it isn't
Under rain clouds in Britain it's a strange sound I'm bringing
Yet it resonates within 'em from the underground
System, with the gutter-sounding wisdom
So they elevate with instinct, I'm original, no imprint
Every millisecond's different
Bring the colour like I'm pigment
Paint the soundscape in an instant
With The Four Owls imprint my instinct is addictive
Our decisions make a difference, it's on you to show persistence
Your choice, your existence!`;*/

const enrichedGrids = SPLIT_TO_GRIDS(lyrics).map(grid => TRANSFORM_GRID(grid)); 

const processedGrids = enrichedGrids.map(enrichedGrid => {
	const grid = enrichedGrid.grid;
	const phoneticsIndex = enrichedGrid.phoneticsIndex;
	const indexedRhymes = {};

	let rhymeCounter = 0; // We assign a unique number to each set of rhymes we find to color them later
	let gridOutput = '<p>\n';

	for (const phoneticsKey in phoneticsIndex) {
		const phoneticsGrouping = phoneticsIndex[phoneticsKey];
		rhymeCounter++;

		for (const phoneticIndex in phoneticsGrouping) {
			const phonetic = phoneticsGrouping[phoneticIndex];
			const { lineIndex, wordIndex } = phonetic;

			indexedRhymes[lineIndex] = indexedRhymes[lineIndex] || {};
			indexedRhymes[lineIndex][wordIndex] = indexedRhymes[lineIndex][wordIndex] || {};
			indexedRhymes[lineIndex][wordIndex][phoneticIndex] = indexedRhymes[lineIndex][wordIndex][phoneticIndex] || [];

			indexedRhymes[lineIndex][wordIndex][phoneticIndex].push(rhymeCounter); 
		}
	}

	for (const lineIndex in grid) {
		const deconstructedLine = grid[lineIndex].deconstructedLine;

		gridOutput += '\t';

		for (const wordIndex in deconstructedLine) {
			const word = deconstructedLine[wordIndex];

			if (indexedRhymes[lineIndex] && indexedRhymes[lineIndex][wordIndex]) {
				for (const syllableIndex in word.syllables) {
					if (indexedRhymes[lineIndex][wordIndex][syllableIndex]) {
						gridOutput +=
							`<span style='background-color: ${COLOR_SET[indexedRhymes[lineIndex][wordIndex][syllableIndex][0]]}'>${word.syllables[syllableIndex]}</span>`;
					} else {
						gridOutput += word.syllables[syllableIndex];
					}
				}
			} else {
				gridOutput += word.word;
			}

			gridOutput += ' ';
		}

		gridOutput += '<br>\n';
	}

	gridOutput += '</p>';

	return gridOutput;
});

for (const processedGrid of processedGrids) {
	console.log(processedGrid);
}
