const express = require('express');
const app = express();
const cors = require('cors');
const port = 3001;
const board = require('./connect.json');
const solve =  require('./solve.json');
const sortedSolve = solve.map((info) => {
	return info["val"].sort();
}).flat();

app.use(cors());
app.use(express.json());

app.get('/board', (req, res) => {
	res.send(board);
});

const connectionsFromSubmittedVals = (submittedVals) => {
	const sorted = submittedVals.sort();
	let connections = {};
	sorted.forEach((val) => {
		const totalInd = sortedSolve.indexOf(val);
		const category = Math.floor(totalInd / 4);
		if(!connections[category]) {
			connections[category] = 1;	
		} else {
			connections[category] = connections[category] + 1;
		}
	});
	return connections;
}

const respondToConnections = (connections) => {
	const connectVals = Object.values(connections);
	
	const correct = connectVals[0] === 4;
	const categoryLevel = Number.parseInt(Object.keys(connections)[0]);
	
	return {
		correct,
		alreadyGuessed: false,
		categoryDescription: correct ? solve[categoryLevel].desc : "",
		categoryLevel: correct ? categoryLevel + 1 : null,
		oneAway: connectVals.indexOf(3) > -1,
		descriptionWrong: false
	};
}
//express basics and core response issues

app.post('/connect', (req, res) => {
	const submittedValues = req.body.values;
	if(submittedValues.length !== 4) {
		return res.status(400).send("Bad Request");
	}

	const connections = connectionsFromSubmittedVals(submittedValues);
	const response = respondToConnections(connections);
	const description = req.body.description;
	if(response["correct"] && description && description !== response["categoryDescription"]){
		response["categoryDescription"] = "";
		response["descriptionWrong"] = true;
	}
	res.send(response);
});

app.listen(port, () => {
	console.log("Server listening on port " + port);
});