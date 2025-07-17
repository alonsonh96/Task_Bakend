import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import projectRoutes from './routes/ProjectRoutes';
import { setupSwagger } from './docs/swagger';


dotenv.config();
connectDB();
const app = express();
app.use(express.json());


setupSwagger(app)
// Routes
app.use('/api/projects', projectRoutes);

export default app;