// Event model — stores event data with GeoJSON location for geospatial queries
// Two indexes: 2dsphere on location (for $geoNear proximity search)
// and text on title+description (for full-text search)
import { Schema, model, type Document, type Types } from 'mongoose';

export interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IEvent extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: ILocation;
  address: string;
  venue?: string;
  category: string;
  capacity?: number;
  isPublic: boolean;
  organizer: Types.ObjectId;
  createdAt: Date;
}

export const CATEGORIES = [
  'Social',
  'Conference',
  'Music',
  'Sports',
  'Workshop',
  'Networking',
  'Food & Drink',
  'Arts',
  'Other',
] as const;

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    address: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
    },
    category: {
      type: String,
      required: true,
      enum: CATEGORIES,
    },
    capacity: {
      type: Number,
      min: 1,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Geospatial index for location queries
eventSchema.index({ location: '2dsphere' });

// Text index for search
eventSchema.index({ title: 'text', description: 'text' });

const Event = model<IEvent>('Event', eventSchema);
export default Event;
