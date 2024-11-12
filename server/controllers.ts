
import { checkPuzzleFile, getPuzzleFile, requestPuzzleForDay } from './data';
import moment from 'moment';
import {Request, Response} from 'express';
import { convertConnectSolutionBoard } from './serverUtils';

interface PuzzleRequestQuery {
	date: string;
};

export const getBoardHandler = async (req: Request<{}, {}, {}, PuzzleRequestQuery>, res: Response) => {
	const date = req.query.date;
	if(!checkPuzzleFile(date)){
		await requestPuzzleForDay(moment(date));
	}
	const currentPuzzel = getPuzzleFile(date);
	const board = convertConnectSolutionBoard(currentPuzzel);
	res.send(board);
};