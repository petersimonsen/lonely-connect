import cron from 'node-cron';
import fs from 'node:fs';
const dataAccess = require('../../server/data');

jest.mock('node-cron', () => {
    return {
        schedule: jest.fn(),
    }
});

jest.mock('axios', () => {
    return {
        get: () => ({
            data: {
                print_date: "TEST_DATE",
            }
        }),
    }
})

jest.mock('node:fs', () => {
    return {
        writeFileSync: jest.fn()
    }
}); 

const sleep = (ms: number) => {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            console.log(`Slept for ${ms/1000} seconds`);
            resolve();
        }, ms);
    })
}

describe('server', () => {
    test('can run both setup query and CRON job', async () => {
        await sleep(1000);
        const logSpy = jest.spyOn(dataAccess, 'requestPuzzleForDay');
        let mockCronSchedule = <jest.Mock>(cron.schedule);
        mockCronSchedule.mockImplementationOnce(async (freq: any, callback: () => void) => {
            await sleep(1000);
            await callback();
        });
        const serv = require('../../server/server');
        await sleep(1000);
        expect(cron.schedule).toHaveBeenCalledWith("0 6 * * *", expect.any(Function));
        expect(logSpy).toHaveBeenCalledTimes(2);
        expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
        await sleep(1000);
        serv.close();
    });
    afterAll(() => {
        jest.clearAllMocks();
    })
});
