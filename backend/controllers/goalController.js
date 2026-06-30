import Goal from '../model/goalModel.js';

// GET all goals for user
export const getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, data: goals });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ADD a new goal
export const addGoal = async (req, res) => {
    try {
        const { name, targetAmount, deadline, icon, color } = req.body;
        if (!name || !targetAmount) {
            return res.status(400).json({ success: false, message: 'Name and target amount are required' });
        }
        const goal = await Goal.create({
            userId: req.user._id,
            name,
            targetAmount: Number(targetAmount),
            savedAmount: 0,
            deadline: deadline || null,
            icon: icon || '🎯',
            color: color || '#8b5cf6'
        });
        res.status(201).json({ success: true, data: goal });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// UPDATE saved amount (fund the goal)
export const fundGoal = async (req, res) => {
    try {
        const { amount } = req.body;
        const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
        if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

        const newSaved = Math.min(goal.savedAmount + Number(amount), goal.targetAmount);
        goal.savedAmount = newSaved;
        await goal.save();
        res.json({ success: true, data: goal });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// DELETE a goal
export const deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
        res.json({ success: true, message: 'Goal deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
