const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  getEventRegistrations,
  getEventSlots,
  removeRegistration
} = require('../controllers/registrationController');

router.post('/', registerForEvent);
router.get('/event/:eventId', getEventRegistrations);
router.get('/slots/:eventId', getEventSlots);
router.delete('/:id', removeRegistration);

module.exports = router;