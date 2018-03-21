/***********************************************************************
 * Interface and data initialization
 **********************************************************************/  
var shown = 'Info';
var viterbiResult;
var finished = false;
var viterbiStep = 0;

/***********************************************************************
 * Translation Matrix
 **********************************************************************/  
var translationMatrixContainer = document.getElementById('translationMatrix');

var translationMatrixData = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]
];

var exampleTranslationMatrixData = [
			[ 0.17  , 0.257 , 0.409 , 0.114 , 0.009 , 0.014 , 0.021 , 0.006 ],
			[ 0.162 , 0.351 , 0.257  , 0.18  , 0.009 , 0.018 , 0.014 , 0.009 ],
			[ 0.152 , 0.323 , 0.352  , 0.123 , 0.008 , 0.017 , 0.019 , 0.006 ],
			[ 0.076 , 0.343 , 0.361  , 0.17  , 0.004 , 0.018 , 0.019 , 0.009 ],
			[ 0.03  , 0.02  , 0.029  , 0.021 , 0.27  , 0.18  , 0.261 , 0.189 ],
			[ 0.031 , 0.03  , 0.008  , 0.03  , 0.29  , 0.27  , 0.071 , 0.27  ],
			[ 0.025 , 0.025 , 0.03   , 0.02  , 0.225 , 0.225 , 0.27  , 0.18  ],
			[ 0.018 , 0.024 , 0.03   , 0.023 , 0.162 , 0.212 , 0.27  , 0.261 ]
];

var hotTranslationMatrix = new Handsontable(translationMatrixContainer, {
  data: translationMatrixData,
  //validator: probabilityValidator, allowInvalid: true,
  
  //data: data(),
  rowHeaders: true,
  colHeaders: true,
  
  // performance tip: set constant size
  colWidths: 80,
  rowHeights: 23,
  
  // performance tip: turn off calculations
  autoRowSize: false,
  autoColSize: false,
  maxRows: 8,
  maxCols: 8,
  
  colHeaders: ["A+", "C+", "G+", "T+", "A-", "C-", "G-", "T-"],
  rowHeaders: ["A+", "C+", "G+", "T+", "A-", "C-", "G-", "T-"],
});

/***********************************************************************
 * Emission Matrix
 **********************************************************************/

var emissionMatrixContainer = document.getElementById('emissionMatrix');

var exampleEmissionMatrixData = [
  [1, 0, 0, 0, 1, 0, 0, 0],
  [0, 1, 0, 0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0, 0, 1, 0],
  [0, 0, 0, 1, 0, 0, 0, 1]
];

var emissionMatrixData = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]
];

var hotEmissionMatrix = new Handsontable(emissionMatrixContainer, {
  // sheet data
  data: emissionMatrixData,
  
  rowHeaders: true,
  colHeaders: true,
  
  // performance tip: set constant size
  colWidths: 80,
  rowHeights: 23,
  
  // performance tip: turn off calculations
  autoRowSize: false,
  autoColSize: false,
  maxRows: 4,
  maxCols: 8,
  
  // indexes
  colHeaders: ["A+", "C+", "G+", "T+", "A-", "C-", "G-", "T-"],
  rowHeaders: ["A", "C", "G", "T"],
  
  //readOnly: true,
});

/***********************************************************************
 * result Matrix
 **********************************************************************/
var resultMatrixContainer = document.getElementById('resultMatrix');
var resultMatrixData = new Array();
var resultMatrixColumns = new Array();
var resultMatrixRows = ["A+", "C+", "G+", "T+", "A-", "C-", "G-", "T-"];

var hotResultMatrix = new Handsontable(resultMatrixContainer, {
  // sheet data
  data: emissionMatrixData,
  
  rowHeaders: true,
  colHeaders: true,
  
  // performance tip: set constant size
  colWidths: 100,
  rowHeights: 23,
  
  // performance tip: turn off calculations
  autoRowSize: false,
  autoColSize: false,
  maxRows: resultMatrixRows.length,
  maxCols: resultMatrixColumns.length,
  
  // indexes
  colHeaders: resultMatrixColumns,
  rowHeaders: resultMatrixRows,
  readOnly: true,
});

/***********************************************************************
 *			START File.js											   *
 **********************************************************************/
function readSingleFileEmission(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    processData(contents, hotEmissionMatrix);
  };
  reader.readAsText(file);
}
function readSingleFileTranslation(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    processData(contents, hotTranslationMatrix);
  };
  reader.readAsText(file);
}

var inputEmission = document.getElementById('file-input-emission');
var inputTranslation = document.getElementById('file-input-translation');

inputEmission.onclick = function () {
    this.value = null;
}; 
inputEmission.onchange = function (e) {
    readSingleFileEmission(e);
};
inputTranslation.onclick = function () {
    this.value = null;
}; 
inputTranslation.onchange = function (e) {
    readSingleFileTranslation(e);
};

function processData(data, hotMatrix) {
	var lines = data.split(/\r\n|\r|\n/g);
	
	for(var i = 0; i < lines.length-1; i++) {
		line = lines[i].split(',');
		array = [];
		
		for(var j = 0; j < line.length; j++) {
			value = parseFloat(line[j]);
			hotMatrix.setDataAtCell(i, j, value);
		}
	}
	
	console.log(matrix);
}
/**********************************************************************
 *			END File.js												  *
 **********************************************************************/

function runAlg(stepMode) {
	var seq = document.getElementById("sequence").value;
	if (typeof seq === 'undefined' || seq.length < 1) {
		alert("Nie podano sekwencji!");
		return;
	}
	show('Run', stepMode);
}

/**
 * funkcja wyswietlajaca konkretny ekran
 */
function show(subpageToShow, stepMode) {
    document.getElementById(shown).style.display = 'none';
    document.getElementById(subpageToShow).style.display = 'block';
    shown = subpageToShow;
    
    if(subpageToShow == 'Run') {
		return processScreenResult(stepMode);
	}
    return false;
}

function resetState() {
	if (confirm("Czy napewno wyczyścić dane?") == true) {
		document.getElementById("sequence").value = '';

		for(i=0; i<translationMatrixData.length; i++) {
				for(j=0; j<translationMatrixData[i].length; j++) {
						translationMatrixData[i][j] = 0;
				}
		}
		
		for(i=0; i<emissionMatrixData.length; i++) {
				for(j=0; j<emissionMatrixData[i].length; j++) {
						emissionMatrixData[i][j] = 0;
				}
		}
		hotTranslationMatrix.render();
		hotEmissionMatrix.render();
	}
}

function setExample() {
		document.getElementById("sequence").value = 'CGCGATAGCCGT';

		for(i=0; i<translationMatrixData.length; i++) {
				for(j=0; j<translationMatrixData[i].length; j++) {
						translationMatrixData[i][j] = exampleTranslationMatrixData[i][j];
				}
		}
		
		for(i=0; i<emissionMatrixData.length; i++) {
				for(j=0; j<emissionMatrixData[i].length; j++) {
						emissionMatrixData[i][j] = exampleEmissionMatrixData[i][j];
				}
		}
		
		hotTranslationMatrix.render();
		hotEmissionMatrix.render();
}

function processScreenResult(stepMode) {
	var sequence = document.getElementById("sequence").value;
	resultMatrixColumns = sequence.split("");
	resultMatrixRows = ["A+", "C+", "G+", "T+", "A-", "C-", "G-", "T-"];
	hotResultMatrix.updateSettings({
		maxRows: resultMatrixRows.length, 
		maxCols: resultMatrixColumns, 
		colHeaders:resultMatrixColumns, 
		rowHeaders: resultMatrixRows
	});
	viterbiResult = runViterbi(sequence);
	if (stepMode == 1){
		stepByStep();
	} else {
		instantResult();
	}
};
function stepByStep(){
	resultMatrixData = new Array();
	viterbiStep = 0;
	for (i=0; i< resultMatrixRows.length; i++){
		resultMatrixData[i] = new Array();
		for (j=0; j< resultMatrixColumns.length; j++){
			resultMatrixData[i][j] = '';
		}
	}
	hotResultMatrix.updateSettings({
		data: resultMatrixData
	});
	document.getElementById("prevStep").style.display = 'none';
	document.getElementById("nextStep").style.display = '';
	document.getElementById("toEnd").style.display = '';
	document.getElementById("outputSequenceDiv").style.display = 'none';
	document.getElementById("read").style.display = 'none';
	
	document.getElementById("calculationsTextArea").value = '';
	
	document.getElementById("calculations").style.display = '';
	hotResultMatrix.render();
}

function instantResult() {	
	resultMatrixData = new Array();
	for (i=0; i< resultMatrixRows.length; i++){
		resultMatrixData[i] = new Array();
		for (j=0; j< resultMatrixColumns.length; j++){
			resultMatrixData[i][j] = viterbiResult[j][i];
		}
	}
	hotResultMatrix.updateSettings({
		data: resultMatrixData
	});
	document.getElementById("prevStep").style.display = 'none';
	document.getElementById("nextStep").style.display = 'none';
	document.getElementById("toEnd").style.display = 'none';
	document.getElementById("outputSequenceDiv").style.display = 'none';
	document.getElementById("read").style.display = '';
	document.getElementById("calculations").style.display = 'none';
	hotResultMatrix.render();
}

function nextStep() {
	var sequence = document.getElementById("sequence").value.split("");
	if (viterbiStep == 0){
		document.getElementById("prevStep").style.display = '';
	}
	viterbiStep++;
	updateResultArray();
	if (viterbiStep >= sequence.length){
		document.getElementById("nextStep").style.display = 'none';
		document.getElementById("read").style.display = '';
	}
}

function previousStep() {
	var sequence = document.getElementById("sequence").value.split("");
	if (viterbiStep >= sequence.length){
		document.getElementById("nextStep").style.display = '';
		document.getElementById("read").style.display = 'none';
		document.getElementById("outputSequenceDiv").style.display = 'none';
		document.getElementById("calculations").style.display = '';
	}
	viterbiStep--;
	updateResultArray();
	if (viterbiStep == 0){
		document.getElementById("prevStep").style.display = 'none';
	}
}

function toEnd() {
	var sequence = document.getElementById("sequence").value.split("");
	document.getElementById("nextStep").style.display = 'none';
	document.getElementById("prevStep").style.display = '';
	document.getElementById("read").style.display = '';
	document.getElementById("calculations").style.display = 'none';
	while(viterbiStep < sequence.length){
		viterbiStep++;
		updateResultArray();
	}
}

function updateResultArray() {
	var a = viterbiStep -1;
	if (a >= 0){
		for (i=0; i < resultMatrixRows.length; i++) {
			resultMatrixData[i][a] = viterbiResult[a][i];
		}
	}
	
	for (i=a+1; i<resultMatrixColumns.length; i++) {
		for (j=0; j< resultMatrixRows.length; j++){
			resultMatrixData[j][i] = '';
		}
	}
	hotResultMatrix.render();
	if (viterbiStep == 0) {
		return;
	}
	
	var message = new Array();
	var sequence = document.getElementById("sequence").value.split("");
	

	
	var index = getNucletideIndex(sequence[a]);
	if (viterbiStep == 1) {
		for (i =0; i< resultMatrixRows.length; i++){
			message.push(getIndexExtended(i) + ": " + emissionMatrixData[index][i].toString() + "*0.125 = " + resultMatrixData[i][a].toString());
		}
	} else {	
		var prevIndex = getNucletideIndex(sequence[a-1])
		for (i =0; i< resultMatrixRows.length; i++){
			var thisCell = resultMatrixData[i][a];
			if (typeof thisCell.x !== 'undefined' && typeof thisCell.y !== 'undefined'){
				message.push(getIndexExtended(i) + ": " + emissionMatrixData[index][i].toString() + "*(" + translationMatrixData[prevIndex][i].toString() + "*" + resultMatrixData[thisCell.y][thisCell.x].toString() + ") = " + thisCell.toString());
			} else {
				message.push(getIndexExtended(i) + ": " + emissionMatrixData[index][i].toString() + "*(" + translationMatrixData[prevIndex][i].toString() + "*" + resultMatrixData[i][a-1].toString() + ") = " + thisCell.toString());
			}
		}
	}
	
	document.getElementById("calculationsTextArea").value = message.join("\n");
}

function readSequence() {
	var valMax = 0;
	var index = 0;
	var lastColumn = resultMatrixColumns.length-1;
	for (i=0; i<resultMatrixRows.length; i++){
		if (resultMatrixData[i][lastColumn].value > valMax) {
			valMax = resultMatrixData[i][lastColumn].value;
			index = i;
		}
	}
	
	var outputSequence = new Array();
	
	
	var cell = resultMatrixData[index][lastColumn];
	hotResultMatrix.getCell(index, lastColumn).style.color = "white";
	hotResultMatrix.getCell(index, lastColumn).style.backgroundColor  = "#ad2a1a";
	outputSequence[0] = getIndexExtended(index);
	
	while (typeof cell.x !== 'undefined' || typeof cell.y !== 'undefined'){
		hotResultMatrix.getCell(cell.y, cell.x).style.color = "white";
		hotResultMatrix.getCell(cell.y, cell.x).style.backgroundColor  = "#ad2a1a";
		outputSequence.push(getIndexExtended(cell.y));
		cell = resultMatrixData[cell.y][cell.x];
	}
	
	document.getElementById("outputSequenceInput").value = outputSequence.reverse().join();
	document.getElementById("outputSequenceDiv").style.display = '';
	document.getElementById("calculations").style.display = 'none';
}
