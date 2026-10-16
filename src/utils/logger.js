import fs from 'fs';
import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from '../config/index.js';

// Niveles propios (menor número = más severo). Winston loguea el nivel
// configurado y todos los más severos que él.
export const LOG_LEVELS = Object.freeze({
  levels: { fatal: 0, error: 1, warning: 2, info: 3, http: 4, debug: 5 },
  colors: { fatal: 'bold white redBG', error: 'red', warning: 'yellow', info: 'green', http: 'magenta', debug: 'blue' }
});

winston.addColors(LOG_LEVELS.colors);

const isProduction = config.nodeEnv === 'production';
const logsDir = path.resolve(process.cwd(), config.logDir);
fs.mkdirSync(logsDir, { recursive: true });

// Si LOG_LEVEL tiene un valor inválido, se usa un default seguro en vez de romper el arranque.
const consoleLevel = Object.hasOwn(LOG_LEVELS.levels, config.logLevel)
  ? config.logLevel
  : (isProduction ? 'info' : 'debug');

const { combine, timestamp, errors, printf, colorize, json } = winston.format;

// Consola: legible para desarrollo.
const consoleFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  colorize({ all: true }),
  printf(({ timestamp: ts, level, message, stack, service, ...meta }) => {
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} [${level}] ${message}${extra}${stack ? `\n${stack}` : ''}`;
  })
);

// Archivos: JSON, una línea por evento (fácil de parsear/buscar).
const fileFormat = combine(timestamp(), errors({ stack: true }), json());

// Rotación diaria + tope de tamaño + retención, para que los archivos no crezcan sin límite.
const rotatingFile = (filename, level) =>
  new DailyRotateFile({
    dirname: logsDir,
    filename: `${filename}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    maxSize: '5m',      // rota también si el archivo supera 5 MB
    maxFiles: '14d',    // borra los archivos de más de 14 días
    zippedArchive: true,
    level,
    format: fileFormat
  });

const logger = winston.createLogger({
  levels: LOG_LEVELS.levels,
  level: consoleLevel,
  defaultMeta: { service: 'shipnow-api' },
  transports: [
    new winston.transports.Console({ level: consoleLevel, format: consoleFormat }),
    rotatingFile('errors', 'error'),  // error + fatal (los más severos que 'error')
    rotatingFile('fatal', 'fatal')    // sólo fatal
  ],
  exitOnError: false
});

export default logger;
