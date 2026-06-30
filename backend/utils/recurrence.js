import Income from '../model/incomeModel.js';
import Expense from '../model/expenseModel.js';

// Helper to add interval to date
const getNextDate = (date, interval) => {
    const nextDate = new Date(date);
    switch (interval) {
        case 'daily':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
        case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        case 'yearly':
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
    }
    return nextDate;
};

const processRecurringForModel = async (Model, userId) => {
    const recurringItems = await Model.find({ userId, isRecurring: true });
    const now = new Date();

    for (let item of recurringItems) {
        let lastDate = item.lastRecurrenceDate || item.date;
        let nextDate = getNextDate(lastDate, item.recurrenceInterval);

        while (nextDate <= now) {
            const newTransaction = new Model({
                userId: item.userId,
                title: item.title,
                amount: item.amount,
                category: item.category,
                description: item.description,
                date: nextDate,
                isRecurring: false,
                recurrenceInterval: 'none'
            });

            await newTransaction.save();

            item.lastRecurrenceDate = nextDate;
            await item.save();

            lastDate = nextDate;
            nextDate = getNextDate(lastDate, item.recurrenceInterval);
        }
    }
};

export const processUserRecurrences = async (userId) => {
    try {
        await processRecurringForModel(Income, userId);
        await processRecurringForModel(Expense, userId);
        console.log(`Processed recurrences for user ${userId}`);
    } catch (error) {
        console.error('Error processing recurrences:', error);
    }
};
