import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { prisma } from './utils/prisma.js'


const app = express()

app.use(cors())
app.use(helmet())
app.use(express.json())

app.get('/test-db', async (req, res) => {
  const steps = await prisma.step.findMany()
  res.json(steps)
})
export default app