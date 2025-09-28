import type { Request, Response } from "express";
import Note, { INote } from "../models/Note";
import { asyncHandler } from "../utils/asyncHandler";
import mongoose, { Types } from "mongoose";
import { AppError, NotFoundError, UnauthorizedError } from "../utils/errors";
import { sendSuccess } from "../utils/responses";

type NoteParams = {
    noteId : string
}

export class NoteController {

    static createNote = asyncHandler(async(req: Request<{}, {}, INote>, res: Response) => {
        const { content } = req.body
        const note = new Note({
            content: content,
            createdBy: req.user._id,
            task: req.task._id
        })

        const session = await mongoose.startSession()
        try {
            await session.withTransaction(async() => {
                await note.save({ session })
                req.task.notes.push(note.id)
                await req.task.save({ session })
            })
        } catch (error) {
            throw new AppError(500, 'NOTE_CREATE_FAILED');
        } finally {
            await session.endSession()
        }

        return sendSuccess(res, 'NOTE_CREATED', note.toObject());
    })


    static getTaskNotes = asyncHandler(async(req: Request, res: Response) => {
        try {
            const notes = await Note.find({ task: req.task._id });
            return sendSuccess(res, 'NOTES_FETCHED', notes);
        } catch (error) {
            throw new AppError(500, 'NOTE_FETCH_FAILED');
        }
    })

    
    static deleteNote = asyncHandler(async(req: Request<NoteParams>, res: Response) => {
        const { noteId } = req.params

        const note = await Note.findById(noteId)
        if(!note) throw new NotFoundError('NOTE_NOT_FOUND')

        if(!note.createdBy.equals(req.user._id)) throw new UnauthorizedError('UNAUTHORIZED_ACTION')
        
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                req.task.notes = req.task.notes.filter(note => note.id.toString() !== noteId)
                await req.task.save({ session });
                await Note.deleteOne({ _id: noteId }, { session });
            })
        } catch (error) {
             throw new AppError(500, 'NOTE_DELETE_FAILED');
        } finally {
            await session.endSession();
        }

        sendSuccess(res, 'NOTE_DELETED')
    })
}