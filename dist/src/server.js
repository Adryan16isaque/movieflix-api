import express from 'express';
import { PrismaClient } from '@prisma/client';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../swagger.json' with { type: 'json' };
const app = express();
const port = 3000;
const prisma = new PrismaClient();
app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/movies', async (_, res) => {
    const movies = await prisma.movie.findMany({
        orderBy: {
            title: 'asc',
        },
        include: {
            genres: true,
            languages: true,
        },
    });
    res.json(movies);
});
app.post('/movies', async (req, res) => {
    const { title, genre_id, language_id, oscar_count, release_date } = req.body;
    try {
        // verficar no banco se ja existe um filme com nome que esta sendo criado
        //case insitive - se buscar for feita e tive letra maiusculas ou minuscluas porem a mesma palavra vai retornar
        //case sensitive - caso ocrra de ter letras maiuscolas e etc ele nao vai ser retornado
        const movieWithSameTitle = await prisma.movie.findFirst({
            where: { title: { equals: title, mode: 'insensitive' } },
        });
        if (movieWithSameTitle) {
            return res
                .status(409)
                .send({ message: 'Ja existe um filme com esse titulo' });
        }
        await prisma.movie.create({
            data: {
                title,
                genre_id,
                language_id,
                oscar_count,
                release_date: new Date(release_date),
            },
        });
    }
    catch (error) {
        return res.status(500).send({ message: 'Falha ao cadastrar filme' });
    }
    res.status(201).send();
});
app.put('/movies/:id', async (req, res) => {
    //pegar o id do registro que vou atualizar
    const id = Number(req.params.id);
    try {
        const movie = await prisma.movie.findUnique({
            where: {
                id,
            },
        });
        if (!movie) {
            return res.status(404).send({ message: 'Filme nao encontrado' });
        }
        const data = { ...req.body };
        data.release_date = data.realese_date
            ? new Date(data.release_data)
            : undefined;
        //pegar os dados do gilme que vai ser atualizar ele no prisma
        await prisma.movie.update({
            where: {
                id,
            },
            data: {
                release_date: new Date(req.body.release_date),
            },
        });
    }
    catch (error) {
        return res
            .status(500)
            .send({ message: 'Falha ao atualizar o registro do filme' });
    }
    //retornar o status correto informando que o filme foi atualizado
    res.status(200).send();
});
app.delete('/movies/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const movie = await prisma.movie.findUnique({ where: { id } });
        if (!movie) {
            return res.status(404).send({ message: 'Filme nao encontrado' });
        }
        await prisma.movie.delete({
            where: { id },
        });
    }
    catch (error) {
        return res
            .status(500)
            .send({ message: 'Nao foi possivel remover o filme' });
    }
    res.status(200).send();
});
app.get('/movies/:genreName', async (req, res) => {
    //recebr o nome do genero pelo paramentros da rota
    console.log(req.params.genreName);
    //filtrar os filmes do bando pelo genero
    try {
        const moviesFilteresByGenreName = await prisma.movie.findMany({
            include: {
                genres: true,
                languages: true,
            },
            where: {
                genres: {
                    name: {
                        equals: req.params.genreName,
                        mode: 'insensitive',
                    },
                },
            },
        });
        //retornar os filmes filtrados na respostas da rota
        res.status(200).send(moviesFilteresByGenreName);
    }
    catch (error) {
        res.status(500).send({
            message: 'Nao foi possivel buscar filmes por generos',
        });
    }
});
app.listen(port, () => {
    console.log(`Servidor em execucao na porta ${port}`);
});
//# sourceMappingURL=server.js.map