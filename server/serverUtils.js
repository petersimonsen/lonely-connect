const daily = require('./daily.json');


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
};

const convertNYTSolutionSOLVE = (daily) => daily["categories"].map((cat, i) => {
	return {
		"desc": cat["title"],
		"level": i,
		"val": cat["cards"].map((card) => card["content"])
	}
});

const solve = convertNYTSolutionSOLVE(daily);

const sortedSolve = solve.map((info) => {
	return info["val"].sort();
}).flat();

const serverUtils = {
	connectionsFromSubmittedVals,


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

	checkPaintConnections: (elements) => {
		const groupedEl = elements.reduce((dict, el) => {
			if(!dict[el["categoryLevel"]]){
				dict[el["categoryLevel"]] = [el];
			} else {
				dict[el["categoryLevel"]].push(el);
			}
			dict[el["categoryLevel"]].sort();
			return dict;
		},{});
		const connectionsEach = Object.values(groupedEl).map((els) => connectionsFromSubmittedVals(els.map(el => el.name)));
		return connectionsEach.every((connections) => {
			connectVals = Object.values(connections);
			return connectVals[0] === 4;
		});
	},

	paintDescriptionsByCategory: (elements) => {
		//elements assumed to be correct
		const sortedElements = elements.sort((a, b) => {
			return a["categoryLevel"] - b["categoryLevel"];
		});
		const inds = [0, 4, 8, 12];
		const samples = inds.map(ind => sortedElements[ind]);
		const descMap = samples.reduce((dict, el) => {
			const foundSolution = solve.find((solution) => {
				return solution["val"].indexOf(el.name) !== -1;
			});

			dict[el["categoryLevel"]] = foundSolution["desc"];
			return dict;
		}, {});

		return inds.map((ind) => {
			const sample = sortedElements[ind];
			return {
				categoryLevel: sample["categoryLevel"],
				description: descMap[sample["categoryLevel"]],
				answers: sortedElements.slice(ind, ind + 4)
			};
		});
	},

	matchDescription: (desc, input) => {
		const decentLengthMatch = input.length / desc.length > 0.5;
		const contains = desc.trim().toLowerCase().includes(input.trim().toLowerCase());
		return contains && decentLengthMatch;
	},
	
	convertNYTSolutionBOARD: (daily) => {
		const board = Array(16);
		daily["categories"].forEach((cat) => {
			cat["cards"].forEach((card) => {
				const ind = Number(card["position"]);
				const val = card["content"];
				board[ind] = val;
			})
		})
		console.log(board);
		return board;
	},

	convertNYTSolutionSOLVE,

}

module.exports = serverUtils;


