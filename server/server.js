const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const port = process.env.PORT || 8080;
const fs = require('node:fs');
const { 
	connectionsFromSubmittedVals, 
	respondToConnections, 
	matchDescription,
	checkPaintConnections,
	paintDescriptionsByCategory,
	convertNYTSolutionBOARD,
	convertNYTSolutionSOLVE,
} = require('./serverUtils');
const { getPuzzle } = require('./nyt');
const moment = require('moment');

const PUZZLE_FILE_PATH = path.join(__dirname, '/puzzles');
// const DAILY_PATH = `${puzzlePath}/daily.json`;

const checkPuzzleFile = (fileName) => fs.existsSync(`${PUZZLE_FILE_PATH}/${fileName}.json`);

const getPuzzleFile = (fileName) => {
	const rawData = fs.readFileSync(`${PUZZLE_FILE_PATH}/${fileName}.json`);
	return JSON.parse(rawData);
}

const requestPuzzleForDay = async (day = moment()) => {
	try {
		console.log("Generating Puzzle Request...");
		const dailyPuzzel = await getPuzzle(day);
		const fileName = dailyPuzzel.data["print_date"];
		console.log("Puzzle Recieved, writing file...");
		fs.writeFileSync(`${PUZZLE_FILE_PATH}/${fileName}.json`, JSON.stringify(dailyPuzzel.data));
		console.log("Puzzle File Written...");
		currentPuzzel = getPuzzleFile(fileName);
		console.log("...Updated Puzzel");
	} catch (err) {
		console.log("Error Retrieving Puzzel: ");
		console.log(err);	
	}
}

let currentPuzzel = null;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

requestPuzzleForDay();

cron.schedule('0 6 * * *', requestPuzzleForDay);

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.get('/board', async (req, res) => {
	const date = req.query.date;
	console.log(date);
	let puzBoard = currentPuzzel;
	if(!checkPuzzleFile(date)){
		await requestPuzzleForDay(moment(date));
	}
	puzBoard = getPuzzleFile(date);
	const board = convertNYTSolutionBOARD(puzBoard);
	currentPuzzel = puzBoard;
	res.send(board);
});

app.post('/connect', (req, res) => {
	const submittedValues = req.body.values;
	if(submittedValues.length !== 4) {
		return res.status(400).send("Bad Request");
	}

	const connections = connectionsFromSubmittedVals(submittedValues, currentPuzzel);
	const response = respondToConnections(connections, currentPuzzel);
	const description = req.body.description;
	if(response["correct"] && description && description.length > 0 && !matchDescription(description, response["categoryDescription"])){
		response["categoryDescription"] = "";
		response["descriptionWrong"] = true;
	}
	res.send(response);
});

app.post('/paint', (req, res) => {
	const submittedValues = req.body.values;
	if(submittedValues.length !== 16) {
		return res.status(400).send("Bad Request");
	}

	const { correct, oneAway } = checkPaintConnections(submittedValues, currentPuzzel);
	if(!correct){
		res.send({
			correct: false,
			oneAway
		});
		return;
	}
	const answers = paintDescriptionsByCategory(submittedValues, currentPuzzel);

	res.send({
		correct: true,
		answers
	});

});

app.post('/solve', (req, res) => {
	const submittedAnswers = req.body.answers;
	const answerNames = submittedAnswers.reduce((elements, el) => elements.concat(el.answers), []).map(el => el.name);
	const solve = convertNYTSolutionSOLVE(currentPuzzel);
    const otherSolves = solve.filter((el) => !el.val.some((name) => answerNames.indexOf(name) != -1));
    res.send(otherSolves);
});

app.listen(port, () => {
	console.log("Server listening on port " + port);
});