import axios from 'axios'
import cheerio from 'cheerio'
import fs from 'fs'
import uuidv4 from 'uuid/v4'

function writeOnFile(user, movies) {
  fs.writeFileSync(`movies/${user}.json`, JSON.stringify(movies))
}

export async function readMoviesFromFile(user) {
  const file = fs.readFileSync(`movies/${user}.json`)
  const movies = JSON.parse(file)
  return movies
}

export async function getHTML(url) {
  const { data: html } = await axios.get(url)
  return html
}

export async function getMovies(user, startPage) {
  const path = `movies/${user}.json`
  if (fs.existsSync(path)) {
    return readMoviesFromFile(user)
  }

  let page = startPage
  let hasAnotherPage = true
  const movies = []

  while (hasAnotherPage) {
    try {
      const url = `https://filmow.com/usuario/${user}/filmes/ja-vi/?pagina=${page}`
      const html = await getHTML(url)
      const $ = cheerio.load(html)

      console.log(`Fetching movies from ${user} - Page ${page}`)

      $('.movie_list_item').each(async function() {
        const title = $(this)
          .find('.title')
          .text()
        const rating = $(this)
          .find('.star-rating')
          .attr('title')

        const re = /Nota: (.+) estrelas?/

        const movie = {
          id: uuidv4(),
          title,
          rating: rating ? rating.replace(re, '$1') : null
        }

        movies.push(movie)
      })

      page = page + 1
    } catch (err) {
      hasAnotherPage = false
    }
  }

  if (movies.length > 0) {
    writeOnFile(user, movies)
  }

  return movies
}
