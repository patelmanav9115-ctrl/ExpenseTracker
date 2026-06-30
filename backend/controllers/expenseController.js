import expenseModel from "../model/expenseModel.js";
import getDateRange from "../utils/dateFilter.js";
import XLSX from 'xlsx';
import { generateProfessionalReport } from '../utils/pdfGenerator.js';
// add expense
export async function addExpense(req, res) {
    const userId = req.user._id
    const { description, amount, category, date, isRecurring, recurrenceInterval, expenseType } = req.body;

    try {
        if (!description || !amount || !category || !date) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        const newExpense = new expenseModel({
            userId,
            description,
            amount,
            category,
            date: new Date(date),
            isRecurring: isRecurring || false,
            recurrenceInterval: isRecurring ? (recurrenceInterval || 'monthly') : 'none',
            expenseType: expenseType || 'variable',
            lastRecurrenceDate: isRecurring ? new Date(date) : null,
        });
        await newExpense.save()
        res.json({
            success: true,
            message: "Expense added successfully!"
        });
    }

    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

}

// to all expense
export async function getAllExpense(req, res) {
    const userId = req.user._id;
    const { q, category, from, to, page = 1, limit = 50, isRecurring } = req.query;
    
    let query = { userId };
    if (q) query.description = { $regex: q, $options: 'i' };
    if (category) query.category = category;
    if (isRecurring === 'true') query.isRecurring = true;
    if (from || to) {
        query.date = {};
        if (from) query.date.$gte = new Date(from);
        if (to) query.date.$lte = new Date(to);
    }

    try {
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const expense = await expenseModel.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await expenseModel.countDocuments(query);
            
        res.json({
            data: expense,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
        });
    }

    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

// to update the expense 
export async function updateExpense(req, res) {
    const { id } = req.params;
    const userId = req.user._id;
    const { description, amount, expenseType } = req.body;

    try {
        const updatedExpense = await expenseModel.findOneAndUpdate(
            { _id: id, userId },
            { description, amount, expenseType },
            { new: true }
        );

        if (!updatedExpense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }

        res.json({
            success: true,
            message: "Expense updated successfully.",
            data: updatedExpense
        });

    }

    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

// delete an expense
export async function deleteExpense(req, res) {
    const userId = req.user._id;
    try {
        const expense = await expenseModel.findOneAndDelete({ _id: req.params.id, userId });
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }
        return res.json({
            success: true,
            message: "Expense deleted successfully."
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

// download excel for expense
export async function downloadExpenseExcel(req, res) {
    const userId = req.user._id;
    try {
        const expense = await expenseModel.find({ userId }).sort({ date: -1 });
        const plainDate = expense.map((exp) => ({
            description: exp.description,
            Amount: exp.amount,
            Category: exp.category,
            Date: new Date(exp.date).toLocaleDateString(),
        }));

        const worksheet = XLSX.utils.json_to_sheet(plainDate);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'expenseModel');
        
        // Write to buffer instead of disk
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Disposition', 'attachment; filename="expense_details.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    }

    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

// download pdf for expense
export async function downloadExpensePDF(req, res) {
    const userId = req.user._id;
    try {
        const expenses = await expenseModel.find({ userId }).sort({ date: -1 });

        const totalAmount = expenses.reduce((acc, cur) => acc + Number(cur.amount), 0);
        
        // Group by category to find top category
        const categoryMap = {};
        expenses.forEach(e => { categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount });
        let topCategory = 'N/A';
        if (Object.keys(categoryMap).length > 0) {
            topCategory = Object.keys(categoryMap).reduce((a, b) => categoryMap[a] > categoryMap[b] ? a : b);
        }

        const reportData = {
            title: 'Consolidated Expense Report',
            filename: 'expense_report.pdf',
            userName: req.user.name || 'User', // assuming req.user.name exists
            summary: [
                { label: 'Total Expenses', value: `INR ${totalAmount.toLocaleString()}` },
                { label: 'Total Transactions', value: expenses.length.toString() },
                { label: 'Top Spending Category', value: topCategory }
            ],
            tableHeader: [
                { label: "Date", property: 'date', width: 80, renderer: null },
                { label: "Description", property: 'description', width: 150, renderer: null },
                { label: "Category", property: 'category', width: 100, renderer: null },
                { label: "Type", property: 'type', width: 70, renderer: null },
                { label: "Amount", property: 'amount', width: 90, renderer: null, align: 'right' }
            ],
            tableRows: expenses.map(exp => [
                new Date(exp.date).toLocaleDateString(),
                exp.description,
                exp.category,
                exp.expenseType ? exp.expenseType.toUpperCase() : 'VARIABLE',
                `INR ${exp.amount}`
            ])
        };

        await generateProfessionalReport(res, reportData);
        
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Error generating PDF report." });
        }
    }
}

// to get overview of expense
export async function getExpenseOverview(req, res) {
    try {
        const userId = req.user._id;
        const { range = "monthly" } = req.query;
        const { start, end } = getDateRange(range);

        const expense = await expenseModel.find({
            userId,
            date: { $gte: start, $lte: end },
        }).sort({ date: -1 });



        const totalExpense = expense.reduce((acc, cur) => acc + cur.amount, 0);
        const averageExpense =
            expense.length > 0 ? totalExpense / expense.length : 0;
        const numberOfTransactions = expense.length;
        const recentTransactions = expense.slice(0, 5);


        res.json({
            success: true,
            data: {
                totalExpense,
                averageExpense,
                numberOfTransactions,
                recentTransactions,
                range
            }
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}