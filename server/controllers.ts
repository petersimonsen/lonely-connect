
import { checkPuzzleFile, getPuzzleFile, requestPuzzleForDay } from './data';
import moment from 'moment';
import {Request, Response} from 'express';
import { checkPaintConnections, connectionsFromSubmittedVals, convertConnectSolutionBoard, convertConnectSolutionSolution, matchDescription, paintDescriptionsByCategory, respondToConnections } from './serverUtils';

export const getBoardHandler = async (req: Request<{}, {}, {}, { date: string }>, res: Response) => {
	const date = req.query.date;
	if(!checkPuzzleFile(date)){
		await requestPuzzleForDay(moment(date));
	}
	const currentPuzzel = getPuzzleFile(date);
	const board = convertConnectSolutionBoard(currentPuzzel);
	res.send(board);
};

interface PuzzleRequest {
	date: string;
	values: any[];
};

interface PaintReturn {
	correct: boolean;
	oneAway?: boolean;
	answers?: any[];
	error?: string;
};

export const paintHandler = async(req: Request<{}, {}, PuzzleRequest, {}>, res: Response<PaintReturn>) => {
	const date = req.body.date;
	const submittedValues = req.body.values;
	if(submittedValues.length !== 16) {
		return res.status(400).send({ correct: false, error: "Bad Request"});
	}
	if(!checkPuzzleFile(date)){
		return res.status(400).send({ correct: false, error: "Date Not Available"});
	}
	const currentPuzzel = getPuzzleFile(date);

	const { correct, oneAway } = checkPaintConnections(submittedValues, currentPuzzel);
	if(!correct){
		res.send({
			correct: false,
			oneAway
		});
		return;
	}
	const answers = paintDescriptionsByCategory(submittedValues, currentPuzzel);

	res.send({
		correct: true,
		answers
	});
};

/**
 * Deprecated Ideas for connections due to game changes
 */

export const connectAnswerHandler = async (req: Request<{}, {}, {
	date: string;
	description?: string;
	values: any[];
}, {}>, res: Response<{
	correct?: boolean;
	categoryDescription?: string;
	categoryLevel?: number | null;
	descriptionWrong?: boolean;
	oneAway?: boolean;
	error?: string;
}>) => {
	const submittedValues = req.body.values;
	const date = req.body.date;
	if(!checkPuzzleFile(date)){
		return res.status(400).send({ error: "Date Not Available"});
	}
	if(submittedValues.length !== 4) {
		return res.status(400).send({ error: "Bad Request"});
	}

	const currentPuzzel = getPuzzleFile(date);
	const connections = connectionsFromSubmittedVals(submittedValues, currentPuzzel);
	const response = respondToConnections(connections, currentPuzzel);
	const description = req.body.description;
	if(response["correct"] && description && description.length > 0 && !matchDescription(description, response["categoryDescription"])){
		response["categoryDescription"] = "";
		response["descriptionWrong"] = true;
	}
	res.send(response);
};

export const solveHandler = async (req: Request<{}, {}, {
	date: string;
	answers: any[];
}>, res: Response) => {
	const date = req.body.date;
	if(!checkPuzzleFile(date)){
		return res.status(400).send("Date Not Available");
	}
	const currentPuzzel = getPuzzleFile(date);
	const submittedAnswers = req.body.answers;
	const answerNames = submittedAnswers.reduce((elements, el) => elements.concat(el.answers), []).map((el: any) => el.name);
	const solve = convertConnectSolutionSolution(currentPuzzel);
    const otherSolves = solve.filter((el: any) => !el.val.some((name: any) => answerNames.indexOf(name) != -1));
    res.send(otherSolves);
};