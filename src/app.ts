import express from "express"
import { authController, replyController } from "./controller"
import { errorHandler } from "./error"

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/auth', authController)
app.get('/authcallback', replyController)
app.use(errorHandler)


export default app