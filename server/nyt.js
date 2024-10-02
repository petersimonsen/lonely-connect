const axios = require("axios");

const getPuzzle = async () => {
	const date = new Date();
	const day = `${date.getDate()}`.length === 1 ? `0${date.getDate()}` : date.getDate();
	const month = `${date.getMonth() + 1}`.length === 1 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
	const url = `https://www.nytimes.com/svc/connections/v2/${date.getFullYear()}-${month}-${day}.json`;
	const daily = await axios.get(url);
	return daily;
}

module.exports = { getPuzzle };