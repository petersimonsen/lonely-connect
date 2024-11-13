import request from 'supertest';
import express from 'express';
import MOCK_TEST_DATA from '../../server/puzzles/__tests__/TEST_DATA.json';
import fs from 'node:fs';
import axios from 'axios';
import { skip } from 'node:test';
import { Server } from 'node:http';


let serv : Server;

describe('route controllers', () => {
    beforeAll(() => {
        jest.mock('node:fs', () => {
            return {
                writeFileSync: jest.fn(),
                readFileSync: () => JSON.stringify(MOCK_TEST_DATA.testData),
                existsSync: () => true,
            }
        });
        jest.mock('axios', () => {
            return { 
                    get: () => ({ data: MOCK_TEST_DATA.testData }),
                }
            });
        
    })
    afterEach(() => {
        serv.close();
    })
    describe('board route', () => {
        test('should return a board if it has a valid date', async () => {
            serv = require('../../server/server');
            const res = await request(serv).get('/board?date=2024-11-07')
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(MOCK_TEST_DATA.puzzleFormat);
        })
    });
    describe('paint route', () => {

        test('should return an error if a bad solution is passed', async () => {
            serv = require('../../server/server');
            const noValReq = await request(serv)
            .post('/paint')
            .send({
                "date": "2024-05-20",
                "values": []
            })
            .set('Accept', 'application/json')
            expect(noValReq.statusCode).toEqual(400);

            const badDateReq = await request(serv)
            .post('/paint')
            .send({
                "date": "2024-05-20",
                "values": MOCK_TEST_DATA.submittedPaintWrong
            })
            .set('Accept', 'application/json')
            expect(badDateReq.statusCode).toEqual(400);
        });    

        test('should return a proper format if a proper format is passed', async () => {
            serv = require('../../server/server');
            const wrongReq = await request(serv)
            .post('/paint')
            .send(MOCK_TEST_DATA.submittedPaintWrong)
            .set('Accept', 'application/json')
            expect(wrongReq.statusCode).toEqual(200);
            expect(wrongReq.body).toEqual(MOCK_TEST_DATA.submittedWrong);
            

            const twoWrongReq = await request(serv)
            .post('/paint')
            .send(MOCK_TEST_DATA.submittedPaintTwoAway)
            .set('Accept', 'application/json')
            expect(twoWrongReq.statusCode).toEqual(200);
            expect(twoWrongReq.body).toEqual(MOCK_TEST_DATA.submittedOneAway);

            const correctReq = await request(serv)
            .post('/paint')
            .send(MOCK_TEST_DATA.submittedPaintCorrect)
            .set('Accept', 'application/json')
            expect(correctReq.statusCode).toEqual(200);
            expect(correctReq.body.correct).toEqual(true);
        });    
    });
});