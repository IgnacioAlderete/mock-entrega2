import express from 'express';
import cors from 'cors';
import apiRouter from './routes/index.js';
import {errorHandler} from './middleware/errorHandler.js'
import {routeNotFoundHandler} from './middlewares/routeNotFoundHandler.js'
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// rutas no matcheadas
app.use(routeNotFoundHandler)
  

// errores pasados con next(err)
app.use(errorHandler)

export default app;