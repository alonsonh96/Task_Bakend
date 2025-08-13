import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv'
dotenv.config()



import cors from 'cors';
import morgan from 'morgan';
import { corsOptions } from './config/cors';

import { connectDB } from './config/db';
import authRoutes from './routes/AuthRoutes'
import projectRoutes from './routes/ProjectRoutes';
import { setupSwagger } from './docs/swagger';


connectDB();
const app = express();

app.use(cors(corsOptions))
// Middleware para parsear cookies
app.use(cookieParser());
// Logging
app.use(morgan('dev'));
// Body parser, reading data from body into req.body
app.use(express.json());

// Serve static files from the React frontend app
setupSwagger(app)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes);

export default app;