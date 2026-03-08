import Election from "../models/Election.js";
import Club from "../models/Club.js";
import User from "../models/User.js";

// Create new election (Admin / Club admin)
export const createElection = async (req, res) => {
  try {
    const { clubId, candidates } = req.body;

    // Check if club exists
    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ message: "Club not found" });

    // Create election
    const election = await Election.create({ clubId, candidates });
    res.status(201).json({ message: "Election created successfully", election });
  } catch (err) {
    res.status(500).json({ message: "Failed to create election", error: err.message });
  }
};

// Update election (Admin / Club admin)
export const updateElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: "Election not found" });

    Object.assign(election, req.body);
    await election.save();

    res.json({ message: "Election updated successfully", election });
  } catch (err) {
    res.status(500).json({ message: "Failed to update election", error: err.message });
  }
};

// Get all elections (All users)
export const getElections = async (req, res) => {
  try {
    const elections = await Election.find()
      .populate("clubId", "name")
      .populate("candidates", "name email");
    res.json(elections);
  } catch (err) {
    res.status(500).json({ message: "Failed to load elections", error: err.message });
  }
};

// Vote in an election (Students)
export const voteInElection = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: "Election not found" });

    // Prevent duplicate voting
    const alreadyVoted = election.votes.find(
      (v) => v.voterId.toString() === req.user._id.toString()
    );
    if (alreadyVoted) return res.status(400).json({ message: "You have already voted" });

    election.votes.push({ voterId: req.user._id, candidateId });
    await election.save();

    res.json({ message: "Vote submitted successfully", election });
  } catch (err) {
    res.status(500).json({ message: "Failed to vote", error: err.message });
  }
};

// Complete / close election (Admin / Club admin)
export const completeElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: "Election not found" });

    election.status = "completed";
    await election.save();

    res.json({ message: "Election completed successfully", election });
  } catch (err) {
    res.status(500).json({ message: "Failed to complete election", error: err.message });
  }
};