import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRoutes from './routes/upload.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/upload', uploadRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Backend running on port ${process.env.PORT}`);
});
