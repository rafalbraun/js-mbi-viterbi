/***********************************************************************
 * Helper functions
 **********************************************************************/
var outputArray = [];

function getNucletideIndex(nucleotide)
{
    switch(nucleotide)
    {
        case 'A': return 0;
        case 'C': return 1;
        case 'G': return 2;
        case 'T': return 3;
    }
}

function getIndexExtended(index)
{
    switch(index)
    {
        case 0: return 'A+';
        case 1: return 'C+';
        case 2: return 'G+';
        case 3: return 'T+';
        case 4: return 'A-';
        case 5: return 'C-';
        case 6: return 'G-';
        case 7: return 'T-';
    }
}

function rotate( array , times ){
    if (times < 0) {
        times = 8 + times;
    }
	
	retArray = cloneArray(array);
	
    for( i = 0; i < times; i++ ){
        var temp = retArray.shift();
        retArray.push( temp );
    }
    
    return retArray;
}

function round(num, places) {
    magic_number = Math.pow(10, places);
    return Math.round(num * magic_number) / magic_number;
}

function getMaxProbValue(probArray) {
    var max = 0;
    var idx = 0;
    
    for( i = 0; i < probArray.length; i++ ) {
        if(probArray[i].value > max) {
            max = probArray[i].value;
            idx = i;
        }
    }
    
    return [max, idx];
}

function cloneArray(inputArray) {
	var outputArray = [];
	
	for( i = 0; i < inputArray.length; i++) {
		outputArray[i] = inputArray[i];
	}
	return outputArray;
}

/***********************************************************************
 * Matrixes
 **********************************************************************/
function Cell(value, x, y) {
    this.value = value;
    this.x = x;
    this.y = y;
    
    this.toString = function () {
        return value.toString();
    }
}

/***********************************************************************
 * Viterbi algorithm
 **********************************************************************/
function firstStepOutput(nucleotide) {
    index = getNucletideIndex(nucleotide);
    var emissionMatrixRow = emissionMatrixData[index];
    var outputArray = new Array();
    
    for(i = 0; i < emissionMatrixRow.length; i++) {
        outputArray[i] = new Cell(emissionMatrixRow[i] * 0.125);
    }
    return outputArray;
}

function nextStepViterbi(previousOutput, nuclCurr, prevNucl, step) {
    indexCurr = getNucletideIndex(nuclCurr);
    indexPrev = getNucletideIndex(prevNucl);
   
    var emissionMatrixRow = emissionMatrixData[indexCurr];
    var outputArray = new Array();
   
    
    for(var i = 0; i < emissionMatrixRow.length; i++) {
        cell = new Cell(0);
        if (emissionMatrixRow[i] != 0) {
			var val = 0;
			var index = 0;
            for (var j = 0; j < translationMatrixData.length; j++){
                var tmp = translationMatrixData[j][i] * previousOutput[j];
                if (tmp > val){
                    val = tmp;
					index = j;
                }
            }
			cell = new Cell(round(emissionMatrixRow[i]*val, step+2), step-1, index);
        }
        outputArray[i] = cell;
    }
    return outputArray;
}

function runViterbi(sequence) {
	outputArray = [];
	var prevArray = firstStepOutput(sequence[0]);
	var currArray = [];
	outputArray[0] = prevArray;
	
	
	for(j = 1; j < sequence.length; j++) {
		var currNucl = sequence[j];
		var prevNucl = sequence[j-1];
		
		currArray = nextStepViterbi(prevArray, currNucl, prevNucl, j);
		outputArray[j] = currArray;
		
		prevArray = currArray;
	}
	
	return outputArray;
}
