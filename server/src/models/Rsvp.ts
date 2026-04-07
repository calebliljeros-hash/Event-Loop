import { Schema, model, type Document, type Types } from 'mongoose';

export interface IRsvp extends Document {
  event: Types.ObjectId;
  user: Types.ObjectId;
  status: 'attending' | 'maybe' | 'declined';
  respondedAt: Date;
}

const rsvpSchema = new Schema<IRsvp>({
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['attending', 'maybe', 'declined'],
  },
  respondedAt: {
    type: Date,
    default: Date.now,
  },
});

// One RSVP per user per event
rsvpSchema.index({ event: 1, user: 1 }, { unique: true });

const Rsvp = model<IRsvp>('Rsvp', rsvpSchema);
export default Rsvp;
