import incomeModel from "../model/incomeModel.js";
import expenseModel from "../model/expenseModel.js";
import budgetModel from "../model/budgetModel.js";

export async function getDashboardOverview(req, res) {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    try {
        const incomes = await incomeModel.find({
            userId,
            date: { $gte: startOfMonth, $lte: now },
        }).lean();

        const expenses = await expenseModel.find({
            userId,
            date: { $gte: startOfMonth, $lte: now },
        }).lean();



        const monthlyIncome = incomes.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
        const monthlyExpense = expenses.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
        const savings = monthlyIncome - monthlyExpense;
        const savingsRate = monthlyIncome === 0 ? 0 : Math.round((savings / monthlyIncome) * 100);

        const recentTransactions = [
            ...incomes.map((i) => ({ ...i, type: "income" })),
            ...expenses.map((e) => ({ ...e, type: "expense" })),
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

        const spendByCategory = {};
        for (const exp of expenses) {
            const cat = exp.category || "Other";
            spendByCategory[cat] = (spendByCategory[cat] || 0) + Number(exp.amount || 0);
        }

        const expenseDistribution = Object.entries(spendByCategory).map(([category, amount]) => ({
            category,
            amount,
            percent: monthlyExpense === 0 ? 0 : Math.round((amount / monthlyExpense) * 100),
        }));

        // Budget Alerts
        const budgets = await budgetModel.find({ userId }).lean();
        const budgetAlerts = budgets.map(b => {
            const spent = spendByCategory[b.category] || 0;
            const percent = b.limit > 0 ? (spent / b.limit) * 100 : 0;
            return { category: b.category, limit: b.limit, spent, percent };
        }).filter(b => b.percent > 80); // Alert if > 80% spent

        // All Time Stats
        const allIncomes = await incomeModel.find({ userId }).lean();
        const allExpenses = await expenseModel.find({ userId }).lean();
        const totalIncomeAllTime = allIncomes.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
        const totalExpenseAllTime = allExpenses.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
        const totalFixedExpense = allExpenses.filter(e => e.expenseType === 'fixed').reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
        const totalVariableExpense = allExpenses.filter(e => e.expenseType === 'variable' || !e.expenseType).reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
        
        // Upcoming Bills (Next 7 Days)
        const upcomingBills = allExpenses.filter(e => {
            if (!e.isRecurring || !e.lastRecurrenceDate) return false;
            const lastDate = new Date(e.lastRecurrenceDate);
            let nextDate = new Date(lastDate);
            if (e.recurrenceInterval === 'daily') nextDate.setDate(lastDate.getDate() + 1);
            if (e.recurrenceInterval === 'weekly') nextDate.setDate(lastDate.getDate() + 7);
            if (e.recurrenceInterval === 'monthly') nextDate.setMonth(lastDate.getMonth() + 1);
            if (e.recurrenceInterval === 'yearly') nextDate.setFullYear(lastDate.getFullYear() + 1);
            
            const diffDays = (nextDate - now) / (1000 * 3600 * 24);
            if (diffDays >= -1 && diffDays <= 7) {
                e.nextDueDate = nextDate;
                e.dueInDays = Math.ceil(diffDays);
                return true;
            }
            return false;
        }).sort((a, b) => a.nextDueDate - b.nextDueDate);
        
        // Trend Data (Last 6 months)
        const trendData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            
            const mIncome = allIncomes.filter(inc => new Date(inc.date) >= d && new Date(inc.date) < nextMonth).reduce((acc, cur) => acc + Number(cur.amount), 0);
            const mExpense = allExpenses.filter(exp => new Date(exp.date) >= d && new Date(exp.date) < nextMonth).reduce((acc, cur) => acc + Number(cur.amount), 0);
            
            trendData.push({
                month: d.toLocaleString('default', { month: 'short' }),
                income: mIncome,
                expense: mExpense
            });
        }

        // Smart Spending Forecast (Average of last 3 months)
        const last3Months = trendData.slice(-3);
        const forecastAmount = last3Months.length > 0 
            ? last3Months.reduce((sum, item) => sum + item.expense, 0) / last3Months.length 
            : 0;

        return res.status(200).json({
            success: true,
            data: {
                monthlyIncome,
                monthlyExpense,
                savings,
                savingsRate,
                recentTransactions,
                spendByCategory,
                expenseDistribution,
                budgetAlerts,
                allTimeStats: {
                    income: totalIncomeAllTime,
                    expense: totalExpenseAllTime,
                    netWorth: totalIncomeAllTime - totalExpenseAllTime,
                    fixedExpense: totalFixedExpense,
                    variableExpense: totalVariableExpense
                },
                upcomingBills,
                smartForecast: forecastAmount,
                trendData
            }
        })
    }

    catch (err) {
        console.error("GetDashboardOverview Error:", err);
        return res.status(500).json({
            success: false,
            message: "Dashboard fetch failed"
        });
    }
} 