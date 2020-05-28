const nlp = require('compromise');
nlp.extend(require('compromise-syllables'));

const natural = require('natural');
const metaphone = natural.Metaphone;

const { GRID_SIZE, PUNCTUATION_MARKS } = require('./constants');

/* Split a given set of lines or a string of lyrics from a verse or song into chunks of the grid size
 * If a set smaller than the grid size remains at the end, concatenate it to the second-to-last grid
 */
const SPLIT_TO_GRIDS = (lines, gridSize) => {
	gridSize = gridSize || GRID_SIZE; // Fall back to the default in constants if grid size is not provided

	lines = (Array.isArray(lines)) ? lines : lines.split('\n'); // Handle either an array of lines or the raw lyrics
	lines = lines.map(line => line.trim()); // Trim every line
	
	// Initialize an empty array with the amount of chunks we want, then map every element to a slice of the lines
	const barGrids = Array.from({ length: Math.ceil(lines.length / 4) }, (v, i) => lines.slice(i * gridSize, i * gridSize + gridSize));

	// Now check if the last grid isn't long enough
	if (barGrids[barGrids.length -1].length < gridSize) {
		barGrids[barGrids.length - 2] = barGrids[barGrids.length - 2].concat(barGrids.pop());
	}

	return barGrids; 
};

const IS_PUNCTUATION_MARK = (ident) => {
	return PUNCTUATION_MARKS.test(ident);
};

// Given a line, return a set of words, separate punctuation marks
const BUILD_LINE_INDEX = (line) => {
	const separated = line.split(/\s+/g);
	return separated.map(word => word.split(/(?=[.?;,!])/)).flat();
};

// Deconstruct a word into various components
const DECONSTRUCT_WORD = (word) => {
	if (!IS_PUNCTUATION_MARK(word)) {
		const deconstructed = nlp(word).syllables()[0];
		return {
			word: deconstructed.text,
			normal: deconstructed.normal,
			syllables: deconstructed.syllables,
			phonetics: deconstructed.syllables.map(syllable => metaphone.process(syllable))
		};
	} else {
		return {
			word: word,
			ignore: true
		};
	}
};

// Transform a set of lines to a data structure that's easier to store our relevant data in
const TRANSFORM_GRID = (grid) => {

	const phoneticsIndex = {};
	let enrichedGrid = {
		grid: grid.map((line, lineIndex) => {
			const indexedLine = BUILD_LINE_INDEX(line);
			const deconstructedLine = indexedLine.map((word, wordIndex) => {
				const deconstructedWord = DECONSTRUCT_WORD(word);

				for (const phoneticIndex in deconstructedWord.phonetics) {
					const phonetic = deconstructedWord.phonetics[phoneticIndex];
					phoneticsIndex[phonetic] = phoneticsIndex[phonetic] || [];
					phoneticsIndex[phonetic].push({ lineIndex, wordIndex, phoneticIndex }); 
				}

				return deconstructedWord;
			});
			
			return {
				lineIndex,
				originalLine: line,
				deconstructedLine,
				rhymePositions: {}
			};
		}),
	};

	for (const phoneticKey in phoneticsIndex) {
		if (phoneticsIndex[phoneticKey].length <= 1) delete phoneticsIndex[phoneticKey];
	}

	enrichedGrid.phoneticsIndex = phoneticsIndex;

	return enrichedGrid;
};

module.exports = {
	SPLIT_TO_GRIDS,
	TRANSFORM_GRID,
	IS_PUNCTUATION_MARK
};
