import express from 'express';
import { createRequestHandler } from '@remix-run/express';
import * as build from '@remix-run/dev/server-build';

const app = express();

// 添加 Express 中间件来处理 API 路由
app.use('/api', (req, res, next) => {
  if (req.path === '/hello') {
    res.json({ message: 'Hello World from Express API' });
  } else {
    next();
  }
});

// 处理 Remix 路由
app.all(
  '*',
  createRequestHandler({
    build,
    mode: process.env.NODE_ENV,
  })
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

export default app;