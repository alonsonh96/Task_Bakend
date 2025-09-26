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
            },
            createdAt: {
                type: Date,
                default: Date.now
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


// Middleware to deleteOne
TaskSchema.pre('deleteOne', { document: false, query: true }, async function () {
    try {
        const query = this as mongoose.Query<any, any>;
        const { _id: taskId } = query.getFilter();

        if (!taskId) return;

        await mongoose.model("Note").deleteMany({ task: taskId });
    } catch (error) {
        console.error("Error en Task.deleteOne middleware:", error);
        throw error;
    }
});


// Middleware to deleteMany
TaskSchema.pre('deleteMany', { document: false, query: true }, async function () {
    try {
        const query = this as mongoose.Query<any, any>;
        const filter = query.getFilter();

        // We get all the tasks that meet the condition
        const tasks = await mongoose.model("Task").find(filter).distinct("_id");;

        const taskIds = tasks.map(task => task._id);

        if (taskIds.length > 0) {
            await mongoose.model("Note").deleteMany({ task: { $in: taskIds } });
        }
    } catch (error) {
        console.error("Error en middleware Task.deleteMany:", error);
        throw error; 
    }

});

const Task = mongoose.model<ITask>('Task', TaskSchema);
export default Task;