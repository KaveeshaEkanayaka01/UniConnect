const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const Event = require('./models/Event');
const Registration = require('./models/Registration');
const { sendEventReminder } = require('./utils/emailService');

dotenv.config();

const app = express();

// MongoDB Connection (same as your friend)
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'UniConnect Event Management API is running' });
});

cron.schedule('0 9 * * *', async () => {
  console.log('Running daily reminder cron job...');
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const upcomingEvents = await Event.find({
      eventDate: { $gte: tomorrow, $lt: dayAfterTomorrow }
    });

    for (const event of upcomingEvents) {
      const registrations = await Registration.find({
        eventId: event._id,
        status: 'registered'
      });

      for (const reg of registrations) {
        try {
          await sendEventReminder(
            reg.studentEmail,
            reg.studentName,
            event.eventTitle,
            event.eventDate,
            event.venue,
            event.startTime
          );
        } catch (err) {
          console.error(`Failed to send reminder to ${reg.studentEmail}:`, err);
        }
      }
    }
    console.log(`Reminders sent for ${upcomingEvents.length} events`);
  } catch (error) {
    console.error('Cron job error:', error);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});