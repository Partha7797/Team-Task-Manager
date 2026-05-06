import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [120, 'Project title cannot exceed 120 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1200, 'Description cannot exceed 1200 characters'],
      default: ''
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required']
    },
    status: {
      type: String,
      enum: ['Planning', 'Active', 'Completed', 'Archived'],
      default: 'Planning'
    }
  },
  { timestamps: true }
);

projectSchema.index({ title: 'text', description: 'text' });
projectSchema.index({ members: 1 });
projectSchema.index({ createdBy: 1 });

export const Project = mongoose.model('Project', projectSchema);
