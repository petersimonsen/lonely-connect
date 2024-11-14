import * as serverUtils from "../../server/serverUtils";
import MOCK_TEST_DATA from '../../server/puzzles/__tests__/TEST_DATA.json'

describe('ServerUtils', () => {
    describe('convertConnectSolutionSolution', () => {
        it('should return the solved board by level', () => {
            expect(serverUtils.convertConnectSolutionSolution(MOCK_TEST_DATA.testData)).toEqual(MOCK_TEST_DATA.solvedData)
        });
    });
    describe('convertConnectSolutionBoard', () => {
        it('should return the basic board', () => {
            expect(serverUtils.convertConnectSolutionBoard(MOCK_TEST_DATA.testData)).toEqual(MOCK_TEST_DATA.puzzleFormat)
        });
    });
    describe('connectionsFromSubmittedVals', () => {
        it('should return the basic board', () => {
            const cat3Vals = MOCK_TEST_DATA.submittedCategoryGrouped["3"].map((el) => el.name)
            expect(serverUtils.connectionsFromSubmittedVals(
                cat3Vals, 
                MOCK_TEST_DATA.testData)).toEqual({
                    "0": 1,
                    "1": 1,
                    "2": 1,
                    "3": 1
                })
        });
    });
    describe('groupSubmittedElementsByCategory', () => {
        it('should return submitted elements by category level', () => {
            expect(serverUtils.groupSubmittedElementsByCategory(
                MOCK_TEST_DATA.submittedPaintWrong.values)).toEqual(MOCK_TEST_DATA.submittedCategoryGrouped)
        });
    });
    describe('checkPaintConnections', () => {
        it('should return that none are correct from a basic guess', () => {
            expect(serverUtils.checkPaintConnections(
                MOCK_TEST_DATA.submittedPaintWrong.values, 
                MOCK_TEST_DATA.testData)).toEqual(MOCK_TEST_DATA.submittedWrong)
        });
    });
});