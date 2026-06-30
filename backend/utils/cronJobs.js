import cron from 'node-cron';
import expenseModel from '../model/expenseModel.js';
import incomeModel from '../model/incomeModel.js';

const processRecurring = async (Model) => {
    try {
        const today = new Date();
        // Find all recurring records that have an interval set
        const recurringRecords = await Model.find({
            isRecurring: true,
            recurrenceInterval: { $ne: 'none' }
        });

        for (const record of recurringRecords) {
            let lastDate = record.lastRecurrenceDate ? new Date(record.lastRecurrenceDate) : new Date(record.date);
            let nextDate = new Date(lastDate);

            // Calculate next date based on interval
            if (record.recurrenceInterval === 'daily') nextDate.setDate(nextDate.getDate() + 1);
            else if (record.recurrenceInterval === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
            else if (record.recurrenceInterval === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
            else if (record.recurrenceInterval === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

            // If the next date has passed or is today, we create a new entry
            if (nextDate <= today) {
                const newRecord = new Model({
                    description: record.description,
                    amount: record.amount,
                    category: record.category,
                    date: nextDate,
                    userId: record.userId,
                    type: record.type,
                    isRecurring: false, // The new record is just a regular transaction
                    recurrenceInterval: 'none'
                });

                await newRecord.save();

                // Update the last recurrence date on the template
                record.lastRecurrenceDate = nextDate;
                await record.save();
                
                console.log(`[CRON] Created new ${record.type} for ${record.description} on ${nextDate.toDateString()}`);
            }
        }
    } catch (error) {
        console.error('[CRON] Error processing recurring transactions:', error);
    }
};

export const startCronJobs = () => {
    // Run once every day at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('[CRON] Running daily recurring transactions check...');
        await processRecurring(expenseModel);
        await processRecurring(incomeModel);
        console.log('[CRON] Daily check completed.');
    });

    // Also run once immediately on startup (for testing purposes during dev)
    if (process.env.NODE_ENV !== 'production') {
        setTimeout(async () => {
            console.log('[CRON] Running immediate check (dev mode)...');
            await processRecurring(expenseModel);
            await processRecurring(incomeModel);
        }, 5000); // 5 seconds after server start
    }
};
