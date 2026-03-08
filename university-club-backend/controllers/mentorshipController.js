import User from "../models/User.js";
import Mentorship from "../models/Mentorship.js";
  


export const MatchMento = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    const Mentor = await User.find({
        isMentor: true,
        availability: true,
        _id: { $ne: student._id }
    });
    
    const matchs = Mentor.map((mentor) => {
        let score = 0;
         mentor.skills?.forEach((skill) => {
        if (student.skills?.includes(skill)) score += 3;
      });

      if (mentor.department === student.department) score += 2;
      if (mentor.availability) score += 1;

      return { mentor, score };
    });
    const stored = matchs.sort((a, b) => b.score - a.score).slice(0, 5);

    res.json(stored);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  

};


//send request

export const requestMentor = async (req, res) => {  
    try{
        const { mentorId } = req.params;
        const exits = await Mentorship.findOne({
            mentor: mentorId,
            mentee: req.user._id,
            status: "PENDING",
        });

        if (exits){
            return res.status(400).json({message: "Request already sent."});
        }
        const mentorship = await Mentorship.create({
            mentor: mentorId,
            mentee: req.user._id,
            message: req.body.message || "I’d like to request mentorship",

        });
        res.status(201).json(mentorship);

    }catch(err){
        console.error(err);
        res.status(500).json({message: "request failed"});

    }
};

//Mentor sees incoming requests
export const getMentorRequest = async (req, res) => {


    try{
        const requests = await Mentorship.find({
      mentor: req.user._id,
      status: "PENDING",
    }).populate("mentee", "fullName email");

    res.json(requests);
    }catch(err){
    res.status(500).json({ message: "Failed to load requests" });
 
    }
}

//Mentor accepts/rejects request

export const respondToRequest = async (req, res) => {
    try{
        const {status} = req.body;
        const mentorship = await Mentorship.findById(req.params.id);
        if (!mentorship) {
            return res.status(404).json({ message: "Mentorship request not found" });
        }

        if (mentorship.mentor.toString() !== req.user._id.toString()) {
         return res.status(403).json({ message: "Not authorized" });
        }
        mentorship.status = status;
        await mentorship.save();
        res.json({ message: "Request updated successfully", mentorship });
    }catch(err){
        res.status(500).json({ message: "Failed to update request", error: err.message });
    }
}

//Student sees their mentorships

export const getStudentMentorships = async (req, res) => {
    try{
        const mentorships = await Mentorship.find({
            $or: [
        { mentee: req.user._id },
        { mentor: req.user._id },
      ],
        }).populate("mentor mentee", "fullName email "); 
        res.json(mentorships);
    }
    catch(err){
        res.status(500).json({ message: "Failed to load mentorships" });
    }
}