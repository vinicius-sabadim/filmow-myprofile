import express from 'express'
import cors from 'cors'

import { getMovies } from './scrape'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())

app.get('/movies/:user', async (req, res) => {
  const movies = await getMovies(req.params.user)
  res.json(movies)
})

app.listen(PORT, () => console.log(`Server listening on http://localhost:3000`))
