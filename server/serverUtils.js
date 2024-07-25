const solve =  require('./solve.json');
const sortedSolve = solve.map((info) => {
	return info["val"].sort();
}).flat();

module.exports = {
	connectionsFromSubmittedVals: (submittedVals) => {
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
	},


	respondToConnections: (connections) => {
		const connectVals = Object.values(connections);
		
		const correct = connectVals[0] === 4;
		const categoryLevel = Number.parseInt(Object.keys(connections)[0]);
		
		return {
			correct,
			categoryDescription: correct ? solve[categoryLevel].desc : "",
			categoryLevel: correct ? categoryLevel + 1 : null,
			oneAway: connectVals.indexOf(3) > -1,
			descriptionWrong: false
		};
	},


	matchDescription: (desc, input) => {
		const decentLengthMatch = input.length / desc.length > 0.5;
		const contains = desc.trim().toLowerCase().includes(input.trim().toLowerCase());
		return contains && decentLengthMatch;
	}
}


