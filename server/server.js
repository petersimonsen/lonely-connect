const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const cron = require('node-cron');
const port = process.env.PORT || 8080;
const fs = require('node:fs');
const daily = require('./daily.json');
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

let currentPuzzel = daily;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

const getDaily = () => {
	const rawData = fs.readFileSync('./server/daily.json');
	return JSON.parse(rawData);
}

const start = async function () {
	console.log("Generating Puzzle Request...");
	const dailyPuzzel = await getPuzzle();
	console.log("Puzzle Recieved, writing file...");
	fs.writeFileSync('./server/daily.json', JSON.stringify(dailyPuzzel.data));
	console.log("Puzzle File Written...");
	currentPuzzel = getDaily();
	console.log("Updating Puzzel...");
	console.log(currentPuzzel);
}

start();

cron.schedule('0 3 * * *', start);



app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.get('/board', (req, res) => {
	const board = convertNYTSolutionBOARD(currentPuzzel);
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