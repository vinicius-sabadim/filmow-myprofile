import React, { useState } from 'react'
import axios from 'axios'

import './App.css'

function moviesOrdered(movies, orderBy) {
  if (orderBy === 'dateAdded') return movies

  return movies.sort((a, b) => {
    if (a.title === b.title) return 0
    return a.title < b.title ? -1 : 1
  })
}

function App() {
  const [user, setUser] = useState('')
  const [movies, setMovies] = useState([])
  const [orderBy, setOrderBy] = useState('dateAdded')

  async function getMovies() {
    const { data: movies } = await axios.get(
      `http://localhost:5000/movies/${user}`
    )
    setMovies(movies)
  }

  return (
    <div className="App">
      <input
        placeholder="Insert the username"
        type="text"
        value={user}
        onChange={e => setUser(e.target.value)}
      />
      <button onClick={getMovies}>See movies</button>

      <select onChange={e => setOrderBy(e.target.value)}>
        <option value="dateAdded">Date added</option>
        <option value="alphabetically">Alphabetically</option>
      </select>
      <ul>
        {moviesOrdered(movies, orderBy).map((movie, index) => (
          <li key={index}>
            {movie.title} -{' '}
            <strong>{movie.rating ? movie.rating : 'No rating'}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
