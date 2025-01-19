import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
const { combine, timestamp, json, printf } = winston.format;
const timestampFormat = 'MMM-DD-YYYY HH:mm:ss';

export const logger = winston.createLogger({
    format: combine(
      timestamp({ format: timestampFormat }),
      json(),
      printf(({ timestamp, level, message, ...data }) => {
        const response = {
          level,
          message,
          data, // metadata
        };
  
        return JSON.stringify(response);
      })
    ),
    transports: [
        new winston.transports.Console(),
        new DailyRotateFile({
            filename: './logs/pc-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '100m',
            maxFiles: '14d'
        }),
      ],
});
