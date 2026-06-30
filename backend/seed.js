import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

import userModel from './model/userModel.js';
import incomeModel from './model/incomeModel.js';
import expenseModel from './model/expenseModel.js';
import budgetModel from './model/budgetModel.js';
import goalModel from './model/goalModel.js';
import { connectDB } from './config/db.js';

const seedData = async () => {
    try {
        await connectDB();
        
        // Create Dummy User
        const email = 'dummy@example.com';
        let user = await userModel.findOne({ email });
        if (!user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            user = await userModel.create({
                name: 'Dummy User',
                email,
                password: hashedPassword
            });
            console.log('Dummy user created');
        } else {
            console.log('Dummy user already exists');
        }

        const userId = user._id;

        // Clear existing data for dummy user to avoid duplicates
        await incomeModel.deleteMany({ userId });
        await expenseModel.deleteMany({ userId });
        await budgetModel.deleteMany({ userId });
        await goalModel.deleteMany({ userId });

        console.log('Cleared existing data for dummy user');

        // Create Incomes
        const incomes = [
            { description: 'Salary', amount: 5000, category: 'Salary', date: new Date('2023-10-01'), userId },
            { description: 'Freelance Work', amount: 1200, category: 'Freelance', date: new Date('2023-10-15'), userId },
            { description: 'Dividend', amount: 300, category: 'Investments', date: new Date('2023-10-20'), userId }
        ];
        await incomeModel.insertMany(incomes);
        console.log('Dummy incomes added');

        // Create Expenses
        const expenses = [
            { description: 'Groceries', amount: 400, category: 'Food & Dining', date: new Date('2023-10-05'), expenseType: 'variable', userId },
            { description: 'Rent', amount: 1500, category: 'Rent', date: new Date('2023-10-01'), expenseType: 'fixed', userId },
            { description: 'Electricity', amount: 120, category: 'Utilities', date: new Date('2023-10-10'), expenseType: 'fixed', userId },
            { description: 'Dinner Out', amount: 80, category: 'Food & Dining', date: new Date('2023-10-12'), expenseType: 'variable', userId },
            { description: 'Gas', amount: 60, category: 'Transportation', date: new Date('2023-10-14'), expenseType: 'variable', userId }
        ];
        await expenseModel.insertMany(expenses);
        console.log('Dummy expenses added');

        // Create Budgets
        const budgets = [
            { category: 'Food & Dining', limit: 600, period: 'monthly', userId },
            { category: 'Transportation', limit: 200, period: 'monthly', userId }
        ];
        await budgetModel.insertMany(budgets);
        console.log('Dummy budgets added');

        // Create Goals
        const goals = [
            { name: 'Emergency Fund', targetAmount: 10000, savedAmount: 2500, deadline: new Date('2024-12-31'), userId },
            { name: 'Vacation', targetAmount: 3000, savedAmount: 500, deadline: new Date('2024-06-01'), userId }
        ];
        await goalModel.insertMany(goals);
        console.log('Dummy goals added');

        console.log('Data seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
