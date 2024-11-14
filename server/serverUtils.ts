type InputCard = {
	content: string;
	position: number;
}

type InputCategory = {
	title: string;
	cards: InputCard[];
}

type InputConnect = {
	status: string;
	print_date: string;
	categories: InputCategory[];
}

type ParsedSolution = {
	desc: string;
	level: number;
	val: string[];
}

export const convertConnectSolutionSolution = (solution: InputConnect): ParsedSolution[] => solution["categories"].map((cat, i) => {
	return {
		"desc": cat["title"],
		"level": i,
		"val": cat["cards"].map((card) => card["content"])
	}
});

type SubmittedConnection = {
	[index: string]: number;
};

export type SubmittedVal = {
	name: string;
	selectable: boolean;
	categoryLevel: number;
	selected: boolean;
}


export const connectionsFromSubmittedVals = (submittedVals: string[], puzzle: InputConnect): SubmittedConnection => {
	const solve = convertConnectSolutionSolution(puzzle);

	const sortedSolve = solve.map((info) => {
		return info["val"].sort();
	}).flat();
	const sorted = submittedVals.sort();
	let connections: SubmittedConnection = {};
	sorted.forEach((val: string) => {
		const totalInd = sortedSolve.indexOf(val);
		const category = `${Math.floor(totalInd / 4)}`;
		connections[category] = (connections[category] || 0) + 1;
	});
	return connections;
};

type GroupedElementsByCat = {
	[category: string]: SubmittedVal[]
};

export const groupSubmittedElementsByCategory = (elements: SubmittedVal[]): GroupedElementsByCat => elements.reduce((dict: GroupedElementsByCat, el) => {
	if (!dict[el["categoryLevel"]]) {
		dict[el["categoryLevel"]] = [el];
	} else {
		dict[el["categoryLevel"]].push(el);
	}
	dict[el["categoryLevel"]].sort();
	return dict;
}, {});

export type ConnectResponse = {
	correct: boolean;
	categoryDescription: string;
	categoryLevel: number | null;
	descriptionWrong: boolean;
	oneAway: boolean;
}

export const parseConnectionNames = (connections: SubmittedConnection, puzzle: InputConnect): ConnectResponse => {
	const solve = convertConnectSolutionSolution(puzzle);
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
};

export type CheckPaintResp = {
	correct: boolean;
	oneAway?: boolean;
	answers?: PaintAnswers[]
};	

export const checkPaintConnections = (elements: SubmittedVal[], puzzle: InputConnect): CheckPaintResp => {
	const groupedEl = groupSubmittedElementsByCategory(elements);
	const connectionsEach = Object.values(groupedEl).map((els) => connectionsFromSubmittedVals(els.map(el => el.name), puzzle));
	let matchCounter = 0;
	let threeCounter = 0;
	connectionsEach.forEach((connections) => {
		let connectVals = Object.values(connections);
		if (connectVals[0] === 4) matchCounter++;
		if (connectVals.some((val) => val === 3)) threeCounter++;
	});

	return {
		correct: matchCounter === 4,
		oneAway: threeCounter === 2 && matchCounter === 2,
	};
};

export type PaintAnswers = {
	categoryLevel: number;
	description: string;
	answers: SubmittedVal[]
};

export const paintDescriptionsByCategory = (elements: SubmittedVal[], puzzle: InputConnect): PaintAnswers[] => {
	//elements assumed to be correct
	const solve = convertConnectSolutionSolution(puzzle);
	const sortedElements = elements.sort((a, b) => {
		return a["categoryLevel"] - b["categoryLevel"];
	});
	const inds = [0, 4, 8, 12];
	const samples = inds.map(ind => sortedElements[ind]);
	const descMap = samples.reduce((dict: { [key: string]: string }, el) => {
		const foundSolution = solve.find((solution) => {
			return solution["val"].indexOf(el.name) !== -1;
		});

		dict[el["categoryLevel"]] = foundSolution!["desc"];
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
};

export const matchDescription = (desc: string, input: string): boolean => {
	const decentLengthMatch = input.length / desc.length > 0.5;
	const contains = desc.trim().toLowerCase().includes(input.trim().toLowerCase());
	return contains && decentLengthMatch;
};

export const convertConnectSolutionBoard = (solution: InputConnect): { date: string, startBoard: ParsedSolution[] } => {
	const board = Array(16);
	solution["categories"].forEach((cat) => {
		cat["cards"].forEach((card) => {
			const ind = Number(card["position"]);
			const val = card["content"];
			board[ind] = val;
		})
	})
	return {
		startBoard: board,
		date: solution["print_date"],
	};
};


