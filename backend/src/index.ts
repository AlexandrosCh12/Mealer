import express from 'express';
import cors from 'cors';
import mealPlanRoutes from './routes/mealPlanRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', mealPlanRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 Mealer backend started on port ${PORT}`);
});
