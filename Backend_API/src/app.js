const http = require('http');
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const config = require('./config');
const collabWebSocket = require('./services/collabWebSocket');
const { authMiddleware } = require('./middleware/auth');
const { requireProjectAccess } = require('./middleware/projectAccess');
const uploadRouter = require('./routes/upload');
const projectsRouter = require('./routes/projects');
const processingRouter = require('./routes/processing');
const annotationsRouter = require('./routes/annotations');
const sharingRouter = require('./routes/sharing');
const sceneConfigRouter = require('./routes/sceneConfig');
const reportRouter = require('./routes/report');
const integrationsRouter = require('./routes/integrations');
const presenceRouter = require('./routes/presence');
const levelsRouter = require('./routes/levels');

const app = express();
app.use(compression());
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json());
app.use(authMiddleware);
app.get('/upload/formats', (req, res) => {
  const { getAllowedExtensionsForAccept, ALL_EXTENSIONS } = require('./config/allowedFormats');
  res.json({ accept: getAllowedExtensionsForAccept(), extensions: ALL_EXTENSIONS });
});
app.use('/upload', uploadRouter);
app.use('/integrations/push', uploadRouter);
app.use('/projects', projectsRouter);
app.use('/projects/:projectId/annotations', requireProjectAccess, annotationsRouter);
app.use('/projects/:projectId/share', requireProjectAccess, sharingRouter);
app.use('/projects/:projectId/config', requireProjectAccess, sceneConfigRouter);
app.use('/projects/:projectId/report', requireProjectAccess, reportRouter);
app.use('/processing', processingRouter);
app.use('/integrations', integrationsRouter);
app.use('/presence', presenceRouter);
app.use('/projects/:projectId/levels', requireProjectAccess, levelsRouter);

app.use((err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  if (err.code === 'LIMIT_FILE_SIZE') status = 400;
  const message = err.message || 'Internal server error';
  res.status(status).json({ error: message });
});

const server = http.createServer(app);
collabWebSocket.attach(server);
server.listen(config.PORT, () => console.log(`Backend API listening on port ${config.PORT} (HTTP + WebSocket /collab)`));
