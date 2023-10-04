// const winston = require("winston");
const {createLogger, format, transports} = require("winston");
require("winston-daily-rotate-file");

const dashLog = new transports.DailyRotateFile({
  filename: "./logs/dash-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: '1d'
});

const dash = createLogger({
  format: format.combine(
    format.timestamp(), // Add a timestamp to log entries
    format.json()
  ),
  transports: [
    dashLog,
    new transports.Console({
      colorize: true,
    }),
  ],
});

module.exports = {
  dashLogger: dash,
};
