const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const port = process.env.PORT || 8080;
const board = require('./connect.json');
const solve =  require('./solve.json');
const { connectionsFromSubmittedVals, respondToConnections, matchDescription } = require('./serverUtils');


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.get('/board', (req, res) => {
	res.send(board);
});

app.post('/connect', (req, res) => {
	const submittedValues = req.body.values;
	if(submittedValues.length !== 4) {
		return res.status(400).send("Bad Request");
	}

	const connections = connectionsFromSubmittedVals(submittedValues);
	const response = respondToConnections(connections);
	const description = req.body.description;
	if(response["correct"] && description && description.length > 0 && !matchDescription(description, response["categoryDescription"])){
		response["categoryDescription"] = "";
		response["descriptionWrong"] = true;
	}
	res.send(response);
});

app.post('/solve', (req, res) => {
	const submittedAnswers = req.body.answers;
	const answerNames = submittedAnswers.reduce((elements, el) => elements.concat(el.answers), []).map(el => el.name);
    const otherSolves = solve.filter((el) => !el.val.some((name) => answerNames.indexOf(name) != -1));
    res.send(otherSolves);
});

app.listen(port, () => {
	console.log("Server listening on port " + port);
});