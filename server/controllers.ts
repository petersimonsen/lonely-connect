
import { checkPuzzleFile, getPuzzleFile, requestPuzzleForDay } from './data';
import moment from 'moment';
import {Request, Response} from 'express';
import { checkPaintConnections, connectionsFromSubmittedVals, ConnectResponse, convertConnectSolutionBoard, convertConnectSolutionSolution, matchDescription, PaintAnswers, paintDescriptionsByCategory, parseConnectionNames, SubmittedVal } from './serverUtils';
import { BadRequestError } from './errors/error';

export const getBoardHandler = async (req: Request<{}, {}, {}, { date: string }>, res: Response) => {
	const date = req.query.date;
	if(moment(date).isAfter(moment())){
		throw new BadRequestError({
			message: "No Requesting the Future"
		});
	}
	if(!checkPuzzleFile(date)){
		await requestPuzzleForDay(moment(date));
	}
	const currentPuzzel = getPuzzleFile(date);
	const board = convertConnectSolutionBoard(currentPuzzel);
	res.send(board);
};

interface PuzzleRequest {
	date: string;
	values: SubmittedVal[];
};

interface PaintReturn {
	correct: boolean;
	oneAway?: boolean;
	answers?: PaintAnswers[];
};

export const paintHandler = async(req: Request<{}, {}, PuzzleRequest, {}>, res: Response<PaintReturn>) => {
	const date = req.body.date;
	const submittedValues = req.body.values;
	if(submittedValues.length !== 16) {
		throw new BadRequestError({
			message: "Improper value size: " + submittedValues.length,
		});
	}
	if(!checkPuzzleFile(date)){
		throw new BadRequestError({
			message: "Date not available: " + date,
		});
	}
	if(moment(date).isAfter(moment())){
		throw new BadRequestError({
			message: "No Requesting the Future"
		});
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
	values: string[];
}, {}>, res: Response<ConnectResponse>) => {
	const submittedValues = req.body.values;
	const date = req.body.date;
	if(!checkPuzzleFile(date)){
		throw new BadRequestError({
			message: "Date not available: " + date,
		});
	}
	if(submittedValues.length !== 4) {
		throw new BadRequestError({
			message: "Improper value size: " + submittedValues.length,
		});
	}

	const currentPuzzel = getPuzzleFile(date);
	const connections = connectionsFromSubmittedVals(submittedValues, currentPuzzel);
	const parsedConnections = parseConnectionNames(connections, currentPuzzel);
	const description = req.body.description;
	if(parsedConnections["correct"] && description && description.length > 0 && !matchDescription(description, parsedConnections["categoryDescription"]!)){
		parsedConnections["categoryDescription"] = "";
		parsedConnections["descriptionWrong"] = true;
	}
	res.send(parsedConnections);
};

/**
 * not used solve handler, not bothering to import
 */
type WordElement = {
	name: string;
    selectable: boolean;
    categoryLevel: number;
    selected: boolean;
};

type AnswerElement = {
	categoryLevel: number;
    description: string;
    answers: WordElement[];
};

export const solveHandler = async (req: Request<{}, {}, {
	date: string;
	answers: AnswerElement[];
}>, res: Response) => {
	const date = req.body.date;
	if(!checkPuzzleFile(date)){
		throw new BadRequestError({
			message: "Date not available: " + date,
		});
	}
	const currentPuzzel = getPuzzleFile(date);
	const submittedAnswers = req.body.answers;
	const answerNames = submittedAnswers.reduce((elements: WordElement[], el) => elements.concat(el.answers), []).map((el: any) => el.name);
	const solve = convertConnectSolutionSolution(currentPuzzel);
    const otherSolves = solve.filter((el: any) => !el.val.some((name: any) => answerNames.indexOf(name) != -1));
    res.send(otherSolves);
};