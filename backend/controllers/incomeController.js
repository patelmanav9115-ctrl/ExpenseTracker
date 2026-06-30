import incomeModel from "../model/incomeModel.js";
import XLSX from "xlsx";
import getDateRange from "../utils/dateFilter.js";
import { generateProfessionalReport } from '../utils/pdfGenerator.js';



// add income
export async function addIncome(req, res) {
    const userId = req.user._id
    const { description, amount, category, date, isRecurring, recurrenceInterval } = req.body;

    try {
        if (!description || !amount || !category || !date) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const newIncome = new incomeModel({
            userId,
            description,
            amount,
            category,
            date: new Date(date),
            isRecurring: isRecurring || false,
            recurrenceInterval: isRecurring ? (recurrenceInterval || 'monthly') : 'none',
            lastRecurrenceDate: isRecurring ? new Date(date) : null,
        });
        await newIncome.save()
        res.json({
            success: true,
            message: "Income added successfully!"
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

// to get income(all)
export async function getIncome(req, res) {
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
        const income = await incomeModel.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await incomeModel.countDocuments(query);
            
        res.json({
            data: income,
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


// update an income
export async function updateIncome(req, res) {
    const { id } = req.params;
    const userId = req.user._id;
    const { description, amount } = req.body;

    try {
        const updatedIncome = await incomeModel.findOneAndUpdate(
            { _id: id, userId },
            { description, amount },
            { new: true }
        );

        if (!updatedIncome) {
            return res.status(404).json({
                success: false,
                message: "Income not found"
            });
        }

        res.json({
            success: true,
            message: "Income updated successfully.",
            data: updatedIncome
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

// to delete an income
export async function deleteIncome(req, res) {
    const userId = req.user._id;
    try {
        const income = await incomeModel.findOneAndDelete({ _id: req.params.id, userId });
        if (!income) {
            return res.status(404).json({
                success: false,
                message: "Income not found"
            });
        }
        return res.json({
            success: true,
            message: "Income deleted successfully."
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

//to download the date in an excel sheet
export async function downloadIncome(req, res) {
    const userId = req.user._id;
    try {
        const income = await incomeModel.find({ userId }).sort({ date: -1 });
        const plainDate = income.map((inc) => ({
            description: inc.description,
            Amount: inc.amount,
            Category: inc.category,
            Date: new Date(inc.date).toLocaleDateString(),
        }));

        const worksheet = XLSX.utils.json_to_sheet(plainDate);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'IncomeModel');
        
        // Write to buffer instead of disk
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Disposition', 'attachment; filename="income_details.xlsx"');
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

// download pdf for income
export async function downloadIncomePDF(req, res) {
    const userId = req.user._id;
    try {
        const incomes = await incomeModel.find({ userId }).sort({ date: -1 });

        const totalAmount = incomes.reduce((acc, cur) => acc + Number(cur.amount), 0);
        
        // Group by category to find top category
        const categoryMap = {};
        incomes.forEach(e => { categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount });
        let topCategory = 'N/A';
        if (Object.keys(categoryMap).length > 0) {
            topCategory = Object.keys(categoryMap).reduce((a, b) => categoryMap[a] > categoryMap[b] ? a : b);
        }

        const reportData = {
            title: 'Consolidated Income Report',
            filename: 'income_report.pdf',
            userName: req.user.name || 'User', // assuming req.user.name exists
            summary: [
                { label: 'Total Income', value: `INR ${totalAmount.toLocaleString()}` },
                { label: 'Total Transactions', value: incomes.length.toString() },
                { label: 'Top Income Source', value: topCategory }
            ],
            tableHeader: [
                { label: "Date", property: 'date', width: 80, renderer: null },
                { label: "Description", property: 'description', width: 150, renderer: null },
                { label: "Category", property: 'category', width: 100, renderer: null },
                { label: "Amount", property: 'amount', width: 90, renderer: null, align: 'right' }
            ],
            tableRows: incomes.map(inc => [
                new Date(inc.date).toLocaleDateString(),
                inc.description,
                inc.category,
                `INR ${inc.amount}`
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

// to get income overview
export async function getIncomeOverview(req, res) {
    try {
        const userId = req.user._id;
        const { range = "monthly" } = req.query;
        const { start, end } = getDateRange(range);

        const incomes = await incomeModel.find({
            userId,
            date: { $gte: start, $lte: end },
        }).sort({ date: -1 });



        const totalIncome = incomes.reduce((acc, cur) => acc + cur.amount, 0);
        const averageIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;
        const numberOfTransactions = incomes.length;

        const recentTransactions = incomes.slice(0, 9);

        res.json({
            success: true,
            data: {
                totalIncome,
                averageIncome,
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