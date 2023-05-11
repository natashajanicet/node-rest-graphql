import express from 'express';

import todosRouter from './routes/todos';

const app = express();

app.use(express.json());

app.use(todosRouter);

app.listen(3000);