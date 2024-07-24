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

//express basics and core response issues

app.post('/connect', (req, res) => {
	const sorted = req.body.values.sort();
	if(sorted.length !== 4) {
		return res.status(400).send("Bad Request");
	}
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
	// console.log(connections);
	const connectVals = Object.values(connections);
	
	const correct = connectVals[0] === 4;
	const categoryLevel = Number.parseInt(Object.keys(connections)[0]);
	// console.log(connectVals);
	res.send({
		correct,
		alreadyGuessed: false,
		categoryDescription: correct ? solve[categoryLevel].desc : "",
		categoryLevel: correct ? categoryLevel : null,
		oneAway: connectVals.indexOf(3) > -1
	});
});

app.listen(port, () => {
	console.log("Server listening on port " + port);
});