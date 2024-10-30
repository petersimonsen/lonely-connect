const axios = require("axios");
const moment = require("moment");

const getPuzzle = async (requestData = moment()) => {
	let date = requestData < moment().subtract(30, 'days') ? moment() : requestData;
	const apiString = date.format("YYYY-MM-DD");
	const url = `https://www.nytimes.com/svc/connections/v2/${apiString}.json`;
	const daily = await axios.get(url);
	return daily;
}

module.exports = { getPuzzle };