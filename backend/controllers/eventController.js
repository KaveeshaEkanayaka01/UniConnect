const Event = require('../models/Event');
const Registration = require('../models/Registration');

const createEvent = async (req, res) => {
  try {
    const eventData = {
      eventTitle: req.body.eventTitle,
      description: req.body.description,
      eventCategory: req.body.eventCategory,
      customCategory: req.body.customCategory || '',
      eventDate: req.body.eventDate,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      venue: req.body.venue,
      studentCapacity: parseInt(req.body.studentCapacity),
      organisingClubName: req.body.organisingClubName,
      organiserName: req.body.organiserName,
      organiserPhone: req.body.organiserPhone,
      registrationDeadline: req.body.registrationDeadline,
      eventPoster: req.file ? `/uploads/${req.file.filename}` : ''
    };

    const event = new Event(eventData);
    const savedEvent = await event.save();
    res.status(201).json({ message: 'Event created successfully', event: savedEvent });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ eventDate: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const updateData = {
      eventTitle: req.body.eventTitle,
      description: req.body.description,
      eventCategory: req.body.eventCategory,
      customCategory: req.body.customCategory || '',
      eventDate: req.body.eventDate,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      venue: req.body.venue,
      studentCapacity: parseInt(req.body.studentCapacity),
      organisingClubName: req.body.organisingClubName,
      organiserName: req.body.organiserName,
      organiserPhone: req.body.organiserPhone,
      registrationDeadline: req.body.registrationDeadline
    };

    if (req.file) {
      updateData.eventPoster = `/uploads/${req.file.filename}`;
    }

    const event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event updated successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    await Registration.deleteMany({ eventId: req.params.id });
    res.json({ message: 'Event and all associated registrations deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent
};