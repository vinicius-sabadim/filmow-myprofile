import axios from 'axios'
import cheerio from 'cheerio'
import fs from 'fs'

const user = process.argv[2]
if (!user) {
  console.error('Please inform an user.')
  process.exit()
}

async function getHTML(url) {
  const { data: html } = await axios.get(url)
  return html
}

async function run() {
  let page = 1
  let hasAnotherPage = true
  const movies = []

  while (hasAnotherPage) {
    try {
      const url = `https://filmow.com/usuario/${user}/filmes/ja-vi/?pagina=${page}`
      const html = await getHTML(url)
      const $ = cheerio.load(html)

      console.log(`Fetching movies for the page ${page}...`)

      $('.movie_list_item').each(async function() {
        const title = $(this)
          .find('.title')
          .text()
        const rating = $(this)
          .find('.star-rating')
          .attr('title')

        const re = /Nota: (.+) estrelas?/

        const movie = {
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
  writeOnFile(movies)
}

const writeOnFile = movies => {
  fs.writeFileSync('movies.json', JSON.stringify(movies))
}

run()
