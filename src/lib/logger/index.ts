import winston from "winston";

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Determine log level based on environment
const level = process.env.NODE_ENV === "development" ? "debug" : "warn";

// Define log colors
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${info.message} ${info.stack || ""}`
  )
);

// Define transports
const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.simple()
    ),
  }),
];

// Create logger instance
const logger = winston.createLogger({
  level,
  levels,
  format,
  transports,
  handleExceptions: true,
  handleRejections: true,
});

// Add file transport in production
if (process.env.NODE_ENV === "production") {
  logger.add(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: winston.format.combine(
        winston.format.uncolorize(),
        winston.format.json()
      ),
    })
  );
  logger.add(
    new winston.transports.File({
      filename: "logs/combined.log",
      format: winston.format.combine(
        winston.format.uncolorize(),
        winston.format.json()
      ),
    })
  );
}

export default logger;

export function createLogger(context: string) {
  return {
    error: (message: string, meta?: any) =>
      logger.error(`[${context}] ${message}`, meta),
    warn: (message: string, meta?: any) =>
      logger.warn(`[${context}] ${message}`, meta),
    info: (message: string, meta?: any) =>
      logger.info(`[${context}] ${message}`, meta),
    debug: (message: string, meta?: any) =>
      logger.debug(`[${context}] ${message}`, meta),
    http: (message: string, meta?: any) =>
      logger.http(`[${context}] ${message}`, meta),
  };
}
