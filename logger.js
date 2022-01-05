const winston = require('winston');
require('winston-daily-rotate-file');

const { combine, timestamp, label, printf, prettyPrint } = winston.format;
const myFormat = printf(({level, message, timestamp}) => {
    return `${timestamp},${level},${JSON.stringify(message)}`;
});

const logger = winston.createLogger({
    format: combine(
        timestamp({format:'YYYY-MM-DD_HH:mm:SS'}),
        myFormat
    ),
    transports: [
        new winston.transports.DailyRotateFile({
            filename: 'combined_%DATE%.log',
            dirname: 'logs',
            datePattern: 'YYYY-MM-DD'
        }),
        new winston.transports.DailyRotateFile({
            filename: 'error_%DATE%.log',
            dirname: 'logs',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
        }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({ format: winston.format.simple() }));
}

module.exports = logger;