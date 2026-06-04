import express from 'express'
import { PrismaClient } from '../generated/prisma/index.js'
const app = express()
const port = 3000

const prisma = new PrismaClient()

app.get('/movies', async (_, res) => {
    const movies = await prisma.movie.findMany({
        orderBy: {
            title: 'asc',
        },
        include: {
            genres: true,
            languages:true,
        },
    })
    res.json(movies)
})

app.listen(port, () => {
    console.log(`Servidor em execucao na porta ${port}`)
})
