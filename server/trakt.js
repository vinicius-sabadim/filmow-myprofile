import cheerio from 'cheerio'
import child_process from 'child_process'

import { getHTML, readMoviesFromFile, writeOnFile } from './scrape'
import logger from './utils/logger'

const USER = 'thundets'
const xCSRFToken =
  'zsqXynWDnkNxO7S1FP7q4JwQkpqFiNVHLD+sLC3mEsaF0PIn6ZXLoN5+jTqKIpD1MyLgr/EDkjv1KwriIBSWoQ=='
const traktSession =
  'SkMxL3F4S09keG4xMTN5c1FCWWVRWlNOUzRyV2JHOXlCWmViQUpldkp4dkF5MUVYYVpRQXNoaHBqa1RyekYxOEhvTmMybEhyTW9nbUpHdm52dG4wTEVCQVlva1NGQUh3RHVYcTdMb1JadHAxcTlZWi92RCt4NnRDd1JhWGVWaHQwY2xBR0FpdkYxWnVCUHZ0YzhOQUpGVTZWMllUd0N1dWRtR0pUeEZ2cHdrTEFrUTRhbEhpZkRJUStCdFpyT3B5YkVETWRLUHQzSlVxUUEwVTJ0VTRybTVGUlN6d1lmS2p4NGRoMzZSME5EOXdwZnJUNm52Zk5sQ3h5YTlJWU5nM1FtMVR3bGY0N21aRVNpOS90RVdsS2Jqelo3TVdIY0FPSHdlUlkvbW9wUFE9LS1aQ2kyZ0Rlemc3YWM5ZTJvM3JSN1NRPT0%3D--5cf91c42a9545e2a39fc6228d9cb00292e045c25'

function runCmd(cmd) {
  const resp = child_process.execSync(cmd)
  const result = resp.toString('UTF8')
  return JSON.parse(result)
}

function formatMovies(movies) {
  return movies.map(movie => ({
    ...movie,
    title: movie.title.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
    rating: movie.rating * 2
  }))
}

function addOnWatchList(url, xCSRFToken, traktSession, movieId, movie) {
  const cmd = `curl -sS ${url}/watch -H 'x-csrf-token: ${xCSRFToken}' -H 'cookie: _traktsession=${traktSession}' --data 'type=movie&trakt_id=${movieId}&watched_at=now&collected_at=now' --compressed`
  const result = runCmd(cmd)

  if (result.success) {
    logger.log(`${movie.title} was added to the watched list.`)
  } else {
    logger.error(`Error to add the movie ${movie.title} on watched list.`)
  }
}

function rateMovie(url, xCSRFToken, traktSession, movieId, movieRating, movie) {
  const cmd = `curl -sS ${url}/rate -H 'x-csrf-token: ${xCSRFToken}' -H 'cookie: _traktsession=${traktSession}' --data 'type=movie&trakt_id=${movieId}&stars=${movieRating}' --compressed`
  const result = runCmd(cmd)

  if (result.success) {
    logger.log(`${movie.title} was rated with ${movieRating} stars.`)
  } else {
    logger.error(`Error to rate the movie ${movie.title}.`)
  }
}

async function track() {
  const movies = await readMoviesFromFile(USER)
  const moviesFormatted = formatMovies(movies)
  const moviesWithError = []

  for await (const movie of moviesFormatted) {
    const searchUrl = `https://trakt.tv/search?query=${movie.title}`

    const html = await getHTML(searchUrl)
    const $ = cheerio.load(html)

    const noResults = $('.no-results').html()

    // There are results
    if (!noResults) {
      const numberOfResults = $('.fanarts').children('.grid-item').length

      if (numberOfResults === 1) {
        const movieId = $('.grid-item').data('movie-id')
        const href = $('.grid-item')
          .find('a')
          .attr('href')

        const url = `https://trakt.tv${href}`

        addOnWatchList(url, xCSRFToken, traktSession, movieId, movie)

        if (movie.rating) {
          rateMovie(url, xCSRFToken, traktSession, movieId, movie.rating, movie)
        }
      } else {
        logger.error(`Too many results for the movie ${movie.title}`)
        moviesWithError.push(movie)
      }
    } else {
      logger.error(`Movie ${movie.title} not found on search.`)
    }
  }

  writeOnFile(`movies/${USER}_error.json`, JSON.stringify(moviesWithError))
}

track()
