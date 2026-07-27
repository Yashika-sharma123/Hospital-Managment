const express = require('express');
const http = require('http');
const helmet = require('helmet');
const cors = require('cors');

const env = require('./config/env');
const connectDB = require('./config/db');
const corsOptions = require('./config/corsOptions');
const logger = require('./utils/logger');
const { startGraceExpiryJob } = require('./utils/graceExpiryJob');
const { initSocket } = require('./sockets/socket');

const sanitizeMiddlewares = require('./middleware/sanitize.middleware');
const { generalLimiter } = require('./middleware/rateLimiter.middleware');
const notFound = require('./middleware/notFound.middleware');
const errorMiddleware = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const tokenRoutes = require('./routes/token.routes');
const predictionRoutes = require('./routes/prediction.routes');
const counterRoutes = require('./routes/counter.routes');
const adminRoutes = require('./routes/admin.routes');
const serviceRoutes = require('./routes/service.routes');

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(...sanitizeMiddlewares);
app.use(generalLimiter);

app.get('/api/health', (req, res) => res.json({ success: true, message: 'SBM Hospital Queue System — server is healthy' }));
app.use('/api/auth', authRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/predict', predictionRoutes);
app.use('/api/counters', counterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);

app.use(notFound);
app.use(errorMiddleware);

const httpServer = http.createServer(app);
initSocket(httpServer, env.clientOrigin);

connectDB().then(() => {
  httpServer.listen(env.port, () => {
    logger.info(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
    logger.info('Socket.io ready for real-time connections');
    startGraceExpiryJob();
  });
});

module.exports = app;
