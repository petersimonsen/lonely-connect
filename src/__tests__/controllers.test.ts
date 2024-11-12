import request from 'supertest';
const server = require('../../server/server');
import MOCK_TEST_DATA from '../../server/puzzles/__tests__/TEST_DATA.json';
import fs from 'node:fs';
import axios from 'axios';
import { skip } from 'node:test';

jest.mock('axios', () => {
    return {
        get: () => ({ data: MOCK_TEST_DATA.testData }),
    }
});

jest.mock('node:fs', () => {
    return {
        writeFileSync: jest.fn(),
        readFileSync: () => JSON.stringify(MOCK_TEST_DATA.testData),
        existsSync: () => true,
    }
});


describe('board route', () => {
    test.skip('should return a board if it has a valid date', async () => {
        const res = await request(server).get('/board?date=2024-11-07')
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(MOCK_TEST_DATA.puzzleFormat);
    })
    
})