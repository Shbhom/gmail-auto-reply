import { gmail_v1, google } from "googleapis"
import "dotenv/config"

const credentials = {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
}

const SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.labels",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://mail.google.com/",
];

export const oAuth2Client = new google.auth.OAuth2(
    credentials.clientId,
    credentials.clientSecret,
    credentials.redirectUri
);

export async function getOauthUrl(): Promise<string> {
    const url = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
        response_type: "code"
    })
    return url
}

//function returns all the unreadThreads for today
export async function getUnreadThreads(gmail: gmail_v1.Gmail): Promise<gmail_v1.Schema$Message[]> {
    const threadResponse = await gmail.users.threads.list({
        userId: "me",
        labelIds: ["INBOX"],
        q: "is:unread after:2024/01/17 -label:On Vacation"
    })

    const threads = threadResponse.data.threads || []
    const unrepliedThreads = await filterUnrepliedThreads(threads, gmail)
    return unrepliedThreads
}

async function getMailBuffer(senderEmail: string): Promise<string> {
    const subject = "Auto Reply: Out of Office";
    const messageBody =
        "Hi, This is an Auto reply message, I'm out of office and will connect with you soon";
    return Buffer.from(
        `Content-Type: text/plain; charset="UTF-8"\nMIME-Version: 1.0\nContent-Transfer-Encoding: 7bit\nto: ${senderEmail}\nsubject: ${subject}\n\n${messageBody}`
    ).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function filterUnrepliedThreads(threads: gmail_v1.Schema$Thread[], gmail: gmail_v1.Gmail): Promise<gmail_v1.Schema$Thread[]> {
    const unrepliedThreads = [];

    for (let thread of threads) {
        const threadDetails = await gmail.users.threads.get({
            userId: "me",
            id: thread.id!
        })

        const hasBeenReplied = threadDetails.data.messages?.some(
            (message) =>
                message.labelIds &&
                message.labelIds.includes("SENT") &&
                message.labelIds.includes("INBOX")
        );

        if (!hasBeenReplied) {
            unrepliedThreads.push(thread);
        }
    }

    return unrepliedThreads;
}

async function findOrCreateLabel(name: string, gmail: gmail_v1.Gmail) {
    try {
        const existingLabels = await gmail.users.labels.list({ userId: "me" });
        const foundLabel = existingLabels.data.labels?.find(
            (label) => label.name === name
        );

        if (!foundLabel) {
            const newLabel = await gmail.users.labels.create({
                userId: "me",
                requestBody: { name },
            });
            return newLabel.data;
        }

        return foundLabel;
    } catch (error) {
        console.error("Error in findOrCreateLabel:", error);
        return null;
    }
}

export async function labelAndOrganizeEmail(threadId: string, gmail: gmail_v1.Gmail) {
    try {
        const labelName = "On Vacation";
        let label = await findOrCreateLabel(labelName, gmail);

        // Apply the label to the thread.
        await gmail.users.threads.modify({
            userId: "me",
            id: threadId,
            requestBody: {
                addLabelIds: [label?.id!]
            }
        })
    } catch (error) {
        console.error("Error in labelAndOrganizeEmail:", error);
    }
}

export async function sendReply(threadId: string, gmail: gmail_v1.Gmail) {
    try {
        const thread = await gmail.users.threads.get({
            userId: "me",
            id: threadId
        })
        const messages = thread.data.messages;
        const lastMessage = messages![messages!.length - 1];
        const fromHeader = lastMessage.payload?.headers?.find(
            (header) => header.name === "From"
        );
        const senderEmail = extractEmailAddress(fromHeader?.value as string)
        await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: await getMailBuffer(senderEmail!)
            }
        })
    } catch (err: any) {
        console.error(err)
    }
}

function extractEmailAddress(headerValue: string) {
    const matches = headerValue.match(
        /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
    );
    return matches ? matches[0] : null;
}