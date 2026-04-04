const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');

router.post('/', upload.single('eventPoster'), createEvent);
router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.put('/:id', upload.single('eventPoster'), updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;