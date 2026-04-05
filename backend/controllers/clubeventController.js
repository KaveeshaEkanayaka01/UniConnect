import ClubEvent from "../models/ClubEvent.js";
import Club from "../models/Club.js";

const normalizeSystemRole = (role) => {
  return String(role || "").trim().toUpperCase();
};

const normalizeClubRole = (role) => {
  return String(role || "").trim().toLowerCase();
};

const isSystemAdmin = (user) => {
  return normalizeSystemRole(user?.role) === "SYSTEM_ADMIN";
};

const isClubPrivilegedUser = async (userId, clubId) => {
  const club = await Club.findById(clubId);

  if (!club) return false;

  const member = club.members?.find(
    (m) => String(m?.user?._id || m?.user) === String(userId)
  );

  if (!member) return false;

  const allowedRoles = [
    "club_admin",
    "executive",
    "president",
    "vice_president",
    "secretary",
    "treasurer",
  ];

  return allowedRoles.includes(normalizeClubRole(member.role));
};

export const createClubEvent = async (req, res) => {
  try {
    const {
      club,
      title,
      description,
      category,
      venue,
      startDate,
      endDate,
    } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    if (
      !club ||
      !title ||
      !description ||
      !category ||
      !venue ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    const existingClub = await Club.findById(club);

    if (!existingClub) {
      return res.status(404).json({
        message: "Club not found",
      });
    }

    if (isSystemAdmin(req.user)) {
      return res.status(403).json({
        message: "System admin cannot create event requests",
      });
    }

    const allowed = await isClubPrivilegedUser(req.user._id, club);

    if (!allowed) {
      return res.status(403).json({
        message:
          "Only club admin, executive members, president, vice president, secretary, and treasurer can create event requests",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        message: "Invalid event start/end date",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        message: "End date/time must be after start date/time",
      });
    }

    const imagePath = req.file?.filename ? `/uploads/${req.file.filename}` : "";

    const event = await ClubEvent.create({
      club,
      title: title.trim(),
      description: description.trim(),
      category,
      venue: venue.trim(),
      startDate: start,
      endDate: end,
      image: imagePath,
      approvalStatus: "pending",
      approvalComment: "",
      createdBy: req.user._id,
    });

    const populated = await ClubEvent.findById(event._id)
      .populate("club", "name")
      .populate("createdBy", "fullName email")
      .populate("approvedBy", "fullName email")
      .populate("rejectedBy", "fullName email");

    return res.status(201).json({
      message: "Event request submitted for approval",
      event: populated,
    });
  } catch (error) {
    console.error("createClubEvent error:", error);
    return res.status(500).json({
      message: error.message || "Failed to create event",
    });
  }
};

export const getClubEvents = async (req, res) => {
  try {
    const { clubId } = req.params;

    const filter = { club: clubId };

    if (isSystemAdmin(req.user)) {
      // system admin sees all
    } else {
      const allowed = await isClubPrivilegedUser(req.user?._id, clubId);

      if (!allowed) {
        // regular members/students only see approved events
        filter.approvalStatus = "approved";
      }
      // privileged club users see all their club events, including pending/rejected
    }

    const events = await ClubEvent.find(filter)
      .populate("club", "name")
      .populate("createdBy", "fullName email")
      .populate("approvedBy", "fullName email")
      .populate("rejectedBy", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json(events);
  } catch (error) {
    console.error("getClubEvents error:", error);
    return res.status(500).json({
      message: "Failed to fetch events",
    });
  }
};

export const getPendingClubEvents = async (req, res) => {
  try {
    const events = await ClubEvent.find({ approvalStatus: "pending" })
      .populate("club", "name")
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json(events);
  } catch (error) {
    console.error("getPendingClubEvents error:", error);
    return res.status(500).json({
      message: "Failed to fetch pending events",
    });
  }
};

export const getClubEventById = async (req, res) => {
  try {
    const event = await ClubEvent.findById(req.params.id)
      .populate("club", "name")
      .populate("createdBy", "fullName email")
      .populate("approvedBy", "fullName email")
      .populate("rejectedBy", "fullName email");

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (!isSystemAdmin(req.user)) {
      const allowed = await isClubPrivilegedUser(req.user?._id, event.club?._id || event.club);

      if (!allowed && event.approvalStatus !== "approved") {
        return res.status(403).json({
          message: "Not authorized to view this event",
        });
      }
    }

    return res.status(200).json(event);
  } catch (error) {
    console.error("getClubEventById error:", error);
    return res.status(500).json({
      message: "Failed to fetch event",
    });
  }
};

export const updateClubEvent = async (req, res) => {
  try {
    const event = await ClubEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (isSystemAdmin(req.user)) {
      return res.status(403).json({
        message: "System admin cannot edit event requests",
      });
    }

    const allowed = await isClubPrivilegedUser(req.user._id, event.club);

    if (!allowed) {
      return res.status(403).json({
        message: "Only authorized club officers can update event requests",
      });
    }

    if (req.body.title !== undefined) event.title = req.body.title.trim();
    if (req.body.description !== undefined) {
      event.description = req.body.description.trim();
    }
    if (req.body.category !== undefined) event.category = req.body.category;
    if (req.body.venue !== undefined) event.venue = req.body.venue.trim();
    if (req.body.startDate !== undefined) event.startDate = new Date(req.body.startDate);
    if (req.body.endDate !== undefined) event.endDate = new Date(req.body.endDate);

    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        message: "Invalid event start/end date",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        message: "End date/time must be after start date/time",
      });
    }

    if (req.file?.filename) {
      event.image = `/uploads/${req.file.filename}`;
    }

    event.approvalStatus = "pending";
    event.approvalComment = "";
    event.approvedBy = null;
    event.approvedAt = null;
    event.rejectedBy = null;
    event.rejectedAt = null;

    await event.save();

    const updated = await ClubEvent.findById(event._id)
      .populate("club", "name")
      .populate("createdBy", "fullName email");

    return res.status(200).json({
      message: "Event updated and resubmitted for approval",
      event: updated,
    });
  } catch (error) {
    console.error("updateClubEvent error:", error);
    return res.status(500).json({
      message: error.message || "Failed to update event",
    });
  }
};

export const approveClubEvent = async (req, res) => {
  try {
    const { approvalComment } = req.body;

    const event = await ClubEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    event.approvalStatus = "approved";
    event.approvalComment = approvalComment || "";
    event.approvedBy = req.user._id;
    event.approvedAt = new Date();
    event.rejectedBy = null;
    event.rejectedAt = null;

    await event.save();

    const updated = await ClubEvent.findById(event._id)
      .populate("club", "name")
      .populate("createdBy", "fullName email")
      .populate("approvedBy", "fullName email");

    return res.status(200).json({
      message: "Event approved successfully",
      event: updated,
    });
  } catch (error) {
    console.error("approveClubEvent error:", error);
    return res.status(500).json({
      message: "Failed to approve event",
    });
  }
};

export const rejectClubEvent = async (req, res) => {
  try {
    const { approvalComment } = req.body;

    const event = await ClubEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    event.approvalStatus = "rejected";
    event.approvalComment = approvalComment || "";
    event.rejectedBy = req.user._id;
    event.rejectedAt = new Date();
    event.approvedBy = null;
    event.approvedAt = null;

    await event.save();

    const updated = await ClubEvent.findById(event._id)
      .populate("club", "name")
      .populate("createdBy", "fullName email")
      .populate("rejectedBy", "fullName email");

    return res.status(200).json({
      message: "Event rejected successfully",
      event: updated,
    });
  } catch (error) {
    console.error("rejectClubEvent error:", error);
    return res.status(500).json({
      message: "Failed to reject event",
    });
  }
};

export const deleteClubEvent = async (req, res) => {
  try {
    const event = await ClubEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (isSystemAdmin(req.user)) {
      return res.status(403).json({
        message: "System admin cannot delete events from this page",
      });
    }

    const allowed = await isClubPrivilegedUser(req.user._id, event.club);

    if (!allowed) {
      return res.status(403).json({
        message: "Not authorized to delete this event",
      });
    }

    await event.deleteOne();

    return res.status(200).json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("deleteClubEvent error:", error);
    return res.status(500).json({
      message: "Failed to delete event",
    });
  }
};