import Club from "../models/Club.js";
import User from "../models/User.js";

// Create a new club (Admin only)
export const createClub = async (req, res) => {
  try {
    const clubExists = await Club.findOne({ name: req.body.name });
    if (clubExists) {
      return res.status(400).json({ message: "Club already exists" });
    }

    const club = await Club.create(req.body);
    res.status(201).json({ message: "Club created successfully", club });
  } catch (err) {
    res.status(500).json({ message: "Failed to create club", error: err.message });
  }
};

// Update club details (Admin only)
export const updateClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    Object.assign(club, req.body); // Merge updates
    await club.save();
    res.json({ message: "Club updated successfully", club });
  } catch (err) {
    res.status(500).json({ message: "Failed to update club", error: err.message });
  }
};

// Get all clubs (All users)
export const getClubs = async (req, res) => {
  try {
    const clubs = await Club.find()
      .populate("members", "name email role")
      .populate("roles.president roles.treasurer roles.secretary", "name email role");

    res.json(clubs);
  } catch (err) {
    res.status(500).json({ message: "Failed to load clubs", error: err.message });
  }
};

// Join a club (Student)
export const joinClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    if (club.members.includes(req.user._id)) {
      return res.status(400).json({ message: "Already a member of this club" });
    }

    club.members.push(req.user._id);
    await club.save();

    req.user.clubsJoined.push(club._id);
    await req.user.save();

    res.json({ message: "Joined club successfully", club });
  } catch (err) {
    res.status(500).json({ message: "Failed to join club", error: err.message });
  }
};

// Submit an expense claim (Members only)
export const submitExpense = async (req, res) => {
  try {
    const { description, amount } = req.body;
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    club.budget.expenses.push({
      description,
      amount,
      submittedBy: req.user._id,
      receiptVerified: false,
    });

    await club.save();
    res.status(201).json({ message: "Expense submitted successfully", expenses: club.budget.expenses });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit expense", error: err.message });
  }
};

// Verify expense (Admin/Treasurer)
export const verifyExpense = async (req, res) => {
  try {
    const { clubId, expenseId } = req.params;
    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ message: "Club not found" });

    const expense = club.budget.expenses.id(expenseId);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    expense.receiptVerified = true;
    await club.save();

    res.json({ message: "Expense verified successfully", expense });
  } catch (err) {
    res.status(500).json({ message: "Failed to verify expense", error: err.message });
  }
};

// Add an event (Admin/Club admin)
export const addEvent = async (req, res) => {
  try {
    const { name, date, description } = req.body;
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    club.events.push({ name, date, description });
    await club.save();

    res.status(201).json({ message: "Event added successfully", events: club.events });
  } catch (err) {
    res.status(500).json({ message: "Failed to add event", error: err.message });
  }
};