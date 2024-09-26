export type WordElement = {
	name: string;
    selectable: boolean;
    categoryLevel: number;
    selected: boolean;
};

export type AnswerElement = {
	categoryLevel: number;
    description: string;
    answers: WordElement[];
};

export type SolvedElement = {
	desc: string;
	level: number;
	val: string[];
}