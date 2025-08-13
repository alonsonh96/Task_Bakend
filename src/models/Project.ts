import mongoose from 'mongoose';
import { Document, PopulatedDoc } from 'mongoose';
import { ITask } from './Task';
import { IUser } from './User';
const { Schema } = mongoose;

// Define the type for the Project document
// Omitting Document because we are not using it in this context
// If you need to use Document, you can extend it like this:
export interface IProject extends Document {
  projectName: string;
  clientName: string;
  description: string;
  tasks: PopulatedDoc<ITask & Document>[]; // Array of tasks associated with the project
  manager: PopulatedDoc<IUser & Document>;
}


// Define the Project schema
const ProjectSchema = new Schema<IProject>({
    projectName: {
        type: String,
        required: true,
        trim: true
    },
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    manager: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})


// Save the Project schema with virtuals enabled
// This creates a virtual field 'tasks' in the Project schema that references the Task model
ProjectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project'
});

// Create the Project model
const Project = mongoose.model<IProject>('Project', ProjectSchema);
export default Project;