import path from 'path';
import fs from 'node:fs';
import axios from "axios";
import moment from "moment";
require('dotenv').config()

const PUZZLE_FILE_PATH = path.join(__dirname, '/puzzles');
const API_REQUEST_HOST = process.env.REACT_APP_API_REQUEST;

export const getPuzzle = async (requestData = moment()) => {
	let date = requestData;
	if(!requestData || typeof requestData.isValid === "undefined" || !requestData.isValid() || requestData < moment().subtract(30, 'days')){
		date = moment();
	}
	const apiString = date.format("YYYY-MM-DD");
	const url = `${API_REQUEST_HOST}${apiString}.json`;
	const daily = await axios.get(url);
	return daily;
}
export const getPuzzleFile = (fileName: string) => {
	const rawData = fs.readFileSync(`${PUZZLE_FILE_PATH}/${fileName}.json`, { encoding: 'utf8'});
	return JSON.parse(rawData);
};
export const checkPuzzleFile = (fileName: string): boolean => fs.existsSync(`${PUZZLE_FILE_PATH}/${fileName}.json`);

export const requestPuzzleForDay = async (day = moment()) => {
	try {
		console.log(`Requesting Puzzel ${day}...`);
		const dailyPuzzel = await getPuzzle(day);
		const fileName = dailyPuzzel.data["print_date"];
		console.log("Puzzle Recieved, writing file...");
		fs.writeFileSync(`${PUZZLE_FILE_PATH}/${fileName}.json`, JSON.stringify(dailyPuzzel.data), { encoding: 'utf8'});
		console.log("Puzzle File Written...");
	} catch (err) {
		console.log("Error Retrieving Puzzel: ");
		console.log(err);	
	}
};