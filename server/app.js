import express from 'express'
import { getMoviesForUser, readMoviesFromFile } from './scrape'

const app = express()
const PORT = process.env.PORT || 5000

app.get('/:user', async (req, res) => {
  const movies = await getMoviesForUser(req.params.user)
  res.json(movies)
})

app.get('/movies/:user', async (req, res) => {
  const movies = await readMoviesFromFile(req.params.user)
  res.json(movies)
})

app.listen(PORT, () => console.log(`Server listening on http://localhost:3000`))
