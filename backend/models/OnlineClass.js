const mongoose = require('mongoose');

const onlineClassSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    meetingLink: { type: String, required: true },
    platform: {
      type: String,
      enum: ['zoom', 'google_meet', 'microsoft_teams', 'other'],
      default: 'zoom',
    },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    recordingLink: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OnlineClass', onlineClassSchema);
