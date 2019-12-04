import express from 'express'
import cors from 'cors'

import { getMovies } from './scrape'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())

app.get('/movies/:user', async (req, res) => {
  const startPage =
    req.query && req.query.page ? parseInt(req.query.page, 10) : 1
  const movies = await getMovies(req.params.user, startPage)
  res.json(movies)
})

app.listen(PORT, () => console.log(`Server listening on http://localhost:3000`))
