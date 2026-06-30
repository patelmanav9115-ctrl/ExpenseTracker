import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import { startCronJobs } from './utils/cronJobs.js';

import userRouter from './routes/user.Route.js';
import incomeRouter from './routes/incomeRoute.js';
import expenseRouter from './routes/expenseRoute.js';
import dashboardRouter from './routes/dashboardRoute.js';
import budgetRouter from './routes/budgetRoute.js';
import goalRouter from './routes/goalRoute.js';

const app = express();
const port = process.env.PORT || 4000;

// MIDDLEWARES
app.use(helmet());
app.use(cors({ origin: ['http://localhost:5173', 'https://expense-tracker-bell.vercel.app'], credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased to 1000 to prevent 429 errors during development (hot reloading)
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes.'
});
app.use('/api/users/login', authLimiter);

// DB
connectDB();
startCronJobs();

// ROUTS
app.use("/api/users", userRouter);
app.use("/api/income", incomeRouter);
app.use("/api/expense", expenseRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/budgets", budgetRouter);
app.use("/api/goals", goalRouter);


app.get('/', (req, res) => {
    res.send('Expense Tracker API is running');
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message, stack: err.stack });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})
