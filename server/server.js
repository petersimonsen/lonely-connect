const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const { 
       connectionsFromSubmittedVals, 
       respondToConnections, 
       matchDescription,
       checkPaintConnections,
       paintDescriptionsByCategory,
       convertNYTSolutionBOARD,
       convertNYTSolutionSOLVE,
} = require('./serverUtils');
const { 
	checkPuzzleFile, 
	getPuzzleFile,
	requestPuzzleForDay
 } = require('./nyt');
const moment = require('moment');

const app = express();
const port = process.env.PORT || 8080;
const CRON = process.env.REACT_APP_CRON || '0 6 * * *';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

cron.schedule(CRON, async () => {
	console.log(`CRON RUNNING: ${moment()}`)
	requestPuzzleForDay(moment())
});

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.get('/board', async (req, res) => {
	const date = req.query.date;
	console.log(date);
	if(!checkPuzzleFile(date)){
		await requestPuzzleForDay(moment(date));
	}
	const currentPuzzel = getPuzzleFile(date);
	const board = convertNYTSolutionBOARD(currentPuzzel);
	res.send(board);
});

app.post('/connect', (req, res) => {
	const submittedValues = req.body.values;
	const date = req.body.data;
	if(!checkPuzzleFile(date)){
		return res.status(400).send("Date Not Available");
	}
	if(submittedValues.length !== 4) {
		return res.status(400).send("Bad Request");
	}

	const currentPuzzel = getPuzzleFile(date);
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
	const date = req.body.date;
	const submittedValues = req.body.values;
	if(submittedValues.length !== 16) {
		return res.status(400).send("Bad Request");
	}
	if(!checkPuzzleFile(date)){
		return res.status(400).send("Date Not Available");
	}
	const currentPuzzel = getPuzzleFile(date);

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
	const date = req.body.data;
	if(!checkPuzzleFile(date)){
		return res.status(400).send("Date Not Available");
	}
	const currentPuzzel = getPuzzleFile(date);
	const submittedAnswers = req.body.answers;
	const answerNames = submittedAnswers.reduce((elements, el) => elements.concat(el.answers), []).map(el => el.name);
	const solve = convertNYTSolutionSOLVE(currentPuzzel);
    const otherSolves = solve.filter((el) => !el.val.some((name) => answerNames.indexOf(name) != -1));
    res.send(otherSolves);
});

const server = app.listen(port, () => {
	console.log("Server listening on port " + port);
	requestPuzzleForDay(moment());
});

module.exports = server;