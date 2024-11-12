import { connectionsFromSubmittedVals, respondToConnections, matchDescription, checkPaintConnections, paintDescriptionsByCategory, convertNYTSolutionBOARD, convertNYTSolutionSOLVE } from './serverUtils';
import { checkPuzzleFile, getPuzzleFile, requestPuzzleForDay } from './nyt';
import moment from 'moment';
import {Request, Response} from 'express';

interface PuzzleRequestQuery {
	date: string;
};

export const getBoardHandler = async (req: Request<{}, {}, {}, PuzzleRequestQuery>, res: Response) => {
	const date = req.query.date;
	console.log(date);
	if(!checkPuzzleFile(date)){
		await requestPuzzleForDay(moment(date));
	}
	const currentPuzzel = getPuzzleFile(date);
	const board = convertNYTSolutionBOARD(currentPuzzel);
	res.send(board);
};