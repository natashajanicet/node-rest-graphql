import { Router } from 'express';

import { Todo } from '../models/todo';

type RequestBody = { text: string };
type RequestParams = { todoId: string };

let todos: Todo[] = [];

const router = Router();

router.get('/todo', (req, res, next) => {
  res.status(200).json({ todos });
});

router.post('/todo', (req, res, next) => {
  const body = req.body as RequestBody;
  const newTodo: Todo = {
    id: new Date().toISOString(),
    text: body.text,
  };

  todos.push(newTodo);

  res.status(201).json({ message: 'Created Todo', todos, todo: newTodo });
});

router.put('/todo/:todoId', (req, res, next) => {
  const body = req.body as RequestBody;
  const params = req.params as RequestParams;
  const tId = params.todoId;
  const todoIndex = todos.findIndex((todoItem) => todoItem.id === tId);
  if (todoIndex >= 0) {
    todos[todoIndex] = {
      id: tId,
      text: body.text,
    };
    return res.status(200).json({ message: 'Updated Todo', todos });
  }
  res.status(404).json({ message: 'Could not find todo with such id' });
});

router.delete('/todo/:todoId', (req, res, next) => {
  const params = req.params as RequestParams;
  const tId = params.todoId;
  todos = todos.filter((todoItem) => todoItem.id !== tId);

  res.status(200).json({ message: 'Deleted todo', todos });
});

export default router;
