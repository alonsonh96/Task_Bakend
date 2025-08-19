import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/User";
import { DuplicateError, NotFoundError } from "../utils/errors";
import { sendSuccess } from "../utils/responses";
import Project from "../models/Project";

export class TeamMemberController {

    static findMemberByEmail = asyncHandler(async( req: Request, res: Response ) => {
        const { email } = req.body
        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail }).select('_id email name').lean()
        if(!user) throw new NotFoundError('User not found')
       
        return sendSuccess(res, 'User found successfully', user)
    })


    static addMemberById = asyncHandler(async(req: Request, res: Response) => {
        const { id } = req.body
        
        // Check if the user is already on the team
        if(req.project.team.includes(id)) throw new DuplicateError('User is already a member of this project')

        const user = await User.findById(id).select('id').lean()
        if(!user) throw new NotFoundError('User not found')

        await Project.findByIdAndUpdate(req.project.id, {$addToSet: { team: user._id }}, { new: true })

        sendSuccess(res, 'User added successfully')
    })


}