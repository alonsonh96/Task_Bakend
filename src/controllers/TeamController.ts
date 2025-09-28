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
        if(!user) throw new NotFoundError('TEAM_MEMBER_NOT_FOUND')
       
        return sendSuccess(res, 'TEAM_MEMBER_FETCH_SUCCESS', user)
    })


    static addMemberById = asyncHandler(async(req: Request, res: Response) => {
        const { id } = req.body
        
        // Check if the user is already on the team
        if(req.project.team.includes(id)) throw new DuplicateError('TEAM_MEMBER_ALREADY_EXISTS')

        const user = await User.findById(id).select('id').lean()
        if(!user) throw new NotFoundError('TEAM_MEMBER_NOT_FOUND')

        await Project.findByIdAndUpdate(req.project.id, {$addToSet: { team: user._id }}, { new: true, runValidators: true })

        sendSuccess(res, 'TEAM_MEMBER_ADD_SUCCESS')
    })


    static removeMemberById = asyncHandler(async(req: Request, res: Response) => {
        const { userId } = req.params

        // Verify user exists
        const user = await User.findById(userId).select('_id name email').lean();
        if (!user) throw new NotFoundError('TEAM_MEMBER_NOT_FOUND')

        // Check if the user is already on the team
        const isMember = req.project.team.some(memberId => memberId.toString() === userId);
        if(!isMember) throw new NotFoundError('TEAM_MEMBER_NOT_IN_PROJECT');
        
        await Project.findByIdAndUpdate(req.project._id, {$pull: {team: userId}}, {new:true, runValidators: true})

        sendSuccess(res, 'TEAM_MEMBER_REMOVE_SUCCESS')
    })


    static getMembersByProject = asyncHandler(async(req: Request, res: Response) => {
        const projectId = req.project._id
        const project = await Project.findById(projectId).populate({path: 'team', select: '_id email name'})

        sendSuccess(res, 'TEAM_MEMBERS_FETCH_SUCCESS', project.team)
    })

}