const path = require('path');
const fs = require('node:fs');
const axios = require("axios");
const moment = require("moment");
require('dotenv').config()

const PUZZLE_FILE_PATH = path.join(__dirname, '/puzzles');
const API_REQUEST_HOST = process.env.REACT_APP_API_REQUEST;

const getPuzzle = async (requestData = moment()) => {
	let date = requestData;
	if(!requestData || typeof requestData.isValid === "undefined" || !requestData.isValid() || requestData < moment().subtract(30, 'days')){
		date = moment();
	}
	const apiString = date.format("YYYY-MM-DD");
	const url = `${API_REQUEST_HOST}${apiString}.json`;
	const daily = await axios.get(url);
	return daily;
}
const getPuzzleFile = (fileName) => {
	const rawData = fs.readFileSync(`${PUZZLE_FILE_PATH}/${fileName}.json`);
	return JSON.parse(rawData);
};
const checkPuzzleFile = (fileName) => fs.existsSync(`${PUZZLE_FILE_PATH}/${fileName}.json`);

const requestPuzzleForDay = async (day = moment()) => {
	try {
		console.log(`Requesting Puzzel ${day}...`);
		const dailyPuzzel = await getPuzzle(day);
		const fileName = dailyPuzzel.data["print_date"];
		console.log("Puzzle Recieved, writing file...");
		fs.writeFileSync(`${PUZZLE_FILE_PATH}/${fileName}.json`, JSON.stringify(dailyPuzzel.data));
		console.log("Puzzle File Written...");
	} catch (err) {
		console.log("Error Retrieving Puzzel: ");
		console.log(err);	
	}
}

module.exports = { getPuzzle,
	getPuzzleFile,
	checkPuzzleFile,
	PUZZLE_FILE_PATH,
	requestPuzzleForDay
};
