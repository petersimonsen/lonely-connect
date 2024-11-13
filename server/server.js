const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
require('dotenv').config()
const { requestPuzzleForDay } = require('./data');
const moment = require('moment');
const { getBoardHandler, paintHandler, connectAnswerHandler, solveHandler } = require('./controllers');

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

app.get('/board', getBoardHandler);

app.post('/connect', connectAnswerHandler);

app.post('/paint', paintHandler);

app.post('/solve', solveHandler);

const server = app.listen(port, () => {
	console.log("Server listening on port " + port);
	requestPuzzleForDay(moment());
});

module.exports = server;