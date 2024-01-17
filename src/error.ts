import { Request, Response } from "express"

export class CustomError {
    statusCode: number
    message: string
    constructor(message: string, statusCode: number) {
        this.message = message
        this.statusCode = statusCode
    }
}

export async function errorHandler(err: CustomError | TypeError, req: Request, res: Response) {
    let customError = err
    if (!(customError instanceof CustomError)) {
        customError = new CustomError(err.message, 500)
    }
    return res.status((customError as CustomError).statusCode).json({
        err
    })
}