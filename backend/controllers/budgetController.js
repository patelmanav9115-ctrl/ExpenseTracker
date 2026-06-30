import budgetModel from "../model/budgetModel.js";

// get all budgets
export async function getBudgets(req, res) {
    const userId = req.user._id;
    try {
        const budgets = await budgetModel.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: budgets });
    } catch (error) {
        console.error("Error fetching budgets:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

// add or update a budget
export async function addBudget(req, res) {
    const userId = req.user._id;
    const { category, limit, period } = req.body;

    try {
        if (!category || !limit) {
            return res.status(400).json({ success: false, message: "Category and limit are required" });
        }

        const budget = await budgetModel.findOneAndUpdate(
            { userId, category, period: period || 'monthly' },
            { limit },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json({ success: true, message: "Budget saved successfully!", data: budget });
    } catch (error) {
        console.error("Error adding budget:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

// delete a budget
export async function deleteBudget(req, res) {
    const userId = req.user._id;
    const { id } = req.params;

    try {
        const budget = await budgetModel.findOneAndDelete({ _id: id, userId });
        if (!budget) {
            return res.status(404).json({ success: false, message: "Budget not found" });
        }
        res.json({ success: true, message: "Budget deleted successfully." });
    } catch (error) {
        console.error("Error deleting budget:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}
