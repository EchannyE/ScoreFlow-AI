import { toOperationalLogMessage } from './utils/errorMessage.js'

import 'dotenv/config'
import express   from 'express'
import cors      from 'cors'
import helmet    from 'helmet'
import morgan    from 'morgan'
import rateLimit from 'express-rate-limit'
 
import { connectDB }   from './config/database.js'
import errorHandler    from './middlewares/errorHandlers.js'
 
import authRoutes         from './routes/auth.routes.js'
import campaignRoutes     from './routes/campaign.routes.js'
import submissionRoutes   from './routes/submission.routes.js'
import evaluationRoutes   from './routes/evaluation.routes.js'
import userRoutes         from './routes/user.routes.js'
import notificationRoutes from './routes/notification.routes.js'
 
const app  = express()
const PORT = process.env.PORT ?? 8080
const isDevelopment = process.env.NODE_ENV !== 'production'
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 5000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
})
 
// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(morgan('dev'))
app.use('/api', apiRateLimiter)

app.get("/", (req, res) => {
  res.send("API running");
});

app.head("/", (req, res) => {
  res.status(200).end();
});
 
// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes)
app.use('/api/campaigns',     campaignRoutes)
app.use('/api/submissions',   submissionRoutes)
app.use('/api/evaluations',   evaluationRoutes)
app.use('/api/users',         userRoutes)
app.use('/api/notifications', notificationRoutes)
 
app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', ts: new Date().toISOString() })
)
 
// ── Error handler 
app.use(errorHandler)
 
// ── Start 
async function startServer() {
  try {
    await connectDB()
    app.listen(PORT, () => console.log(`API → http://localhost:${PORT}`))
  } catch (error) {
    console.error('Server startup failed:', toOperationalLogMessage(error))
    process.exit(1)
  }
}

startServer()
 
 
