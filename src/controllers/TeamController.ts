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

        await Project.findByIdAndUpdate(req.project.id, {$addToSet: { team: user._id }}, { new: true, runValidators: true })

        sendSuccess(res, 'User added successfully')
    })


    static removeMemberById = asyncHandler(async(req: Request, res: Response) => {
        const { id } = req.body

        // Verify user exists
        const user = await User.findById(id).select('_id name email').lean();
        if (!user) throw new NotFoundError('User not found')

        // Check if the user is already on the team
        const isMember = req.project.team.some(memberId => memberId.toString() === id);
        if(!isMember) throw new NotFoundError('User is not a member of this project');
        
        await Project.findByIdAndUpdate(req.project._id, {$pull: {team: id}}, {new:true, runValidators: true})

        sendSuccess(res, 'User remove successfully')
    })


    static getMembersByProject = asyncHandler(async(req: Request, res: Response) => {
        const projectId = req.project._id
        const project = await Project.findById(projectId).populate({path: 'team', select: '_id email name'})

        sendSuccess(res, 'List of members', project)
    })

}