import React, { useState } from 'react'
import axios from 'axios'

import './App.css'

function moviesOrdered(movies, orderBy) {
  if (orderBy === 'dateAdded') return movies

  return [...movies].sort((a, b) => {
    if (a.title === b.title) return 0
    return a.title < b.title ? -1 : 1
  })
}

function App() {
  const [user, setUser] = useState('')
  const [movies, setMovies] = useState([])
  const [error, setError] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [orderBy, setOrderBy] = useState('dateAdded')

  async function getMovies() {
    setError('')
    setIsFetching(true)
    setMovies([])

    try {
      const { data: movies } = await axios.get(
        `http://localhost:5000/movies/${user}`
      )

      setIsFetching(false)
      setMovies(movies)
    } catch (err) {
      if (err.response.status === 404) {
        setError('User not found')
      }
      setIsFetching(false)
    }
  }

  return (
    <div className="App">
      <div>
        <input
          placeholder="Insert the username"
          type="text"
          value={user}
          onChange={e => setUser(e.target.value)}
        />
        <button disabled={isFetching} onClick={getMovies}>
          See movies
        </button>

        <select onChange={e => setOrderBy(e.target.value)}>
          <option value="dateAdded">Date added</option>
          <option value="alphabetically">Alphabetically</option>
        </select>
      </div>
      {isFetching && <span className="App__fetching">Fetching movies...</span>}
      {error && <span className="App__error">{error}</span>}
      <ul>
        {moviesOrdered(movies, orderBy).map(movie => (
          <li key={movie.id}>
            {movie.title} -{' '}
            <strong>{movie.rating ? movie.rating : 'No rating'}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
