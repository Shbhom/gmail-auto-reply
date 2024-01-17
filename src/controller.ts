import { Request, Response, NextFunction } from "express";
import { filterUnrepliedThreads, getOauthUrl, getUnreadThreads, labelAndOrganizeEmail, oAuth2Client, sendReply } from "./utils";
import { google } from "googleapis";
import { CustomError } from "./error";

export async function authController(req: Request, res: Response, next: NextFunction) {
    try {
        const authUrl = await getOauthUrl()
        res.redirect(authUrl);
    } catch (err: any) {
        return next(err)
    }
};

export async function replyController(req: Request, res: Response, next: NextFunction) {
    const authCode = req.query.code
    if (!authCode) {
        throw new CustomError("Error: Authorization code is missing", 400)
    }
    try {
        const { tokens } = await oAuth2Client.getToken(authCode as string)
        oAuth2Client.setCredentials(tokens)
        const gmail = google.gmail({ version: "v1", auth: oAuth2Client })
        const threads = await getUnreadThreads(gmail)
        const unrepliedThreads = await filterUnrepliedThreads(threads, gmail)
        if (!unrepliedThreads) {
            return res.status(200).json({
                message: "no unreplied threads"
            })
        }
        for (const thread of unrepliedThreads) {
            await sendReply(thread.id as string, gmail)
            await labelAndOrganizeEmail(thread.id as string, gmail)
        }
        return res.send("Authentication successful! you can close the window")
    } catch (err: any) {
        return next(err)
    }
}
