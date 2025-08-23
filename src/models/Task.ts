import mongoose, { Types } from 'mongoose';
import { Document } from 'mongoose';
const { Schema } = mongoose;

const taskStatus = {
    PENDING: 'pending',
    ON_HOLD: 'onHold',
    IN_PROGRESS: 'inProgress',
    UNDER_REVIEW: 'underReview',
    COMPLETED: 'completed'
} as const;

export type TaskStatus = (typeof taskStatus)[keyof typeof taskStatus];

export interface ITask extends Document {
    name: string;
    description: string;
    project: Types.ObjectId; // Reference to the Project
    status: TaskStatus; // Optional status field
    completedBy: {
        user: Types.ObjectId,
        status: TaskStatus
    }[]
    notes: Types.ObjectId[]
}

export const TaskSchema = new Schema<ITask>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project', // Reference to the Project model
    },
    status: {
        type: String,
        enum: Object.values(taskStatus),
        default: taskStatus.PENDING // Default status is 'pending'
    },
    completedBy: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                default: null
            },
            status: {
                type: String,
                enum: Object.values(taskStatus),
                default: taskStatus.PENDING
            }
        }
    ],
    notes: [
        {
            type: Types.ObjectId,
            ref: 'Note'
        }
    ]
}, {
    timestamps: true // Automatically manage createdAt and updatedAt fields
})

const Task = mongoose.model<ITask>('Task', TaskSchema);
export default Task;