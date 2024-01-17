import { Request, Response } from "express"

export class CustomError extends Error {
    statusCode: number
    constructor(message: string, statusCode: number) {
        super(message)
        this.statusCode = statusCode
    }
}

export async function errorHandler(err: CustomError | TypeError, req: Request, res: Response) {
    let customError = err;
    if (!(customError instanceof CustomError)) {
        customError = new CustomError(err.message, 500)
    }
    return res.status((customError as CustomError).statusCode).json({
        message: customError.message,
    })
}