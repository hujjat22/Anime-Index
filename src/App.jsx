import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'https://api.tvmaze.com'
const FAVORITES_KEY = 'anime-explorer-favorites'

function readFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
  } catch {
    return []
  }
}

async function getAnimePage(page) {
  const response = await fetch(`${API_URL}/shows?page=${page}`)
  if (response.status === 404) return { shows: [], hasMore: false }
  if (!response.ok) throw new Error('Anime could not be loaded. Please try again.')

  const shows = await response.json()
  return {
    shows: shows.filter((show) => show.genres?.includes('Anime')),
    hasMore: shows.length > 0,
  }
}

async function searchAnimeByTitle(title) {
  const response = await fetch(`${API_URL}/search/shows?q=${encodeURIComponent(title)}`)
  if (!response.ok) throw new Error('Search could not be completed. Please try again.')

  const matches = await response.json()
  return matches.map((match) => match.show).filter((show) => show.genres?.includes('Anime'))
}

function AnimeCard({ anime, isFavorite, onToggleFavorite }) {
  const year = anime.premiered?.slice(0, 4) || 'Year unknown'
  const genres = anime.genres?.slice(0, 2).join(' · ')

  return (
    <article className="anime-card">
      <div className="poster-wrap">
        {anime.image?.medium ? <img src={anime.image.medium} alt={`Poster for ${anime.name}`} loading="lazy" /> : <div className="poster-placeholder">ANIME<br />EXPLORER</div>}
        <button
          className={`favorite-button ${isFavorite ? 'is-favorite' : ''}`}
          onClick={() => onToggleFavorite(anime)}
          aria-label={isFavorite ? `Remove ${anime.name} from favorites` : `Add ${anime.name} to favorites`}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
        {anime.rating?.average && <span className="score">★ {anime.rating.average}</span>}
      </div>
      <div className="anime-info">
        <h2 title={anime.name}>{anime.name}</h2>
        <p className="anime-meta">{year} <span>·</span> {anime.status || 'Anime series'}</p>
        <p className="anime-genres">{genres || 'Anime series'}</p>
      </div>
    </article>
  )
}

function App() {
  const [animeList, setAnimeList] = useState([])
  const [searchText, setSearchText] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [favorites, setFavorites] = useState(readFavorites)
  const [showFavorites, setShowFavorites] = useState(false)
  const [nextPage, setNextPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadMoreAnime(startPage = 0, addToEnd = false) {
    setLoading(true)
    setError('')

    try {
      let pageToRead = startPage
      let pageResult = { shows: [], hasMore: true }
      let batch = []

      // Gather up to 12 anime cards from the next catalog pages.
      for (let pagesChecked = 0; pagesChecked < 6 && batch.length < 12 && pageResult.hasMore; pagesChecked += 1) {
        pageResult = await getAnimePage(pageToRead)
        batch = [...batch, ...pageResult.shows]
        pageToRead += 1
      }

      setAnimeList((current) => addToEnd ? [...current, ...batch] : batch)
      setNextPage(pageToRead)
      setHasMore(pageResult.hasMore)
    } catch (loadError) {
      setError(loadError.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMoreAnime()
  }, [])

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])

  async function handleSearch(event) {
    event.preventDefault()
    const query = searchText.trim()
    setShowFavorites(false)

    if (!query) {
      setActiveSearch('')
      setNextPage(0)
      setHasMore(true)
      loadMoreAnime(0)
      return
    }

    setActiveSearch(query)
    setLoading(true)
    setError('')

    try {
      setAnimeList(await searchAnimeByTitle(query))
      setHasMore(false)
    } catch (searchError) {
      setError(searchError.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function loadMore() {
    setActiveSearch('')
    setSearchText('')
    loadMoreAnime(nextPage, true)
  }

  function toggleFavorite(anime) {
    setFavorites((current) => current.some((item) => item.id === anime.id)
      ? current.filter((item) => item.id !== anime.id)
      : [...current, anime])
  }

  const sourceList = showFavorites ? favorites : animeList
  const query = searchText.trim().toLowerCase()
  const visibleAnime = sourceList.filter((anime) => anime.name.toLowerCase().includes(query))

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top"><span className="brand-mark">A</span><span>ANIME INDEX</span></a>
        <span className="topbar-note">A guide for your next watch</span>
        <button className="favorites-toggle" onClick={() => setShowFavorites((current) => !current)}>
          <span>♥</span> {showFavorites ? 'Browse shows' : `My list · ${favorites.length}`}
        </button>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">SERIES, STORIES & WORLDS TO EXPLORE</p>
          <h1>Find your next<br /><em>anime obsession.</em></h1>
          <p className="hero-description">Browse anime across the catalog, search for a series you love, and keep a list of what you want to watch.</p>
          <div className="hero-stats">
            <div><strong>{animeList.length || '—'}</strong><span>Shows loaded</span></div>
            <span className="stat-divider" />
            <div><strong>{favorites.length}</strong><span>In your watchlist</span></div>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-glow" /><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
          <div className="art-disc"><span>ANIME<br />INDEX</span></div>
          <span className="art-star star-one">✦</span><span className="art-star star-two">✧</span>
          <span className="art-caption">EVERY STORY<br />STARTS SOMEWHERE</span>
        </div>
      </section>

      <section className="collection" aria-labelledby="collection-title">
        <div className="collection-heading">
          <div><p className="eyebrow section-eyebrow">{showFavorites ? 'YOUR WATCHLIST' : activeSearch ? 'SEARCH RESULTS' : 'BROWSE THE CATALOG'}</p><h2 id="collection-title">{showFavorites ? 'Saved anime' : activeSearch ? `Results for “${activeSearch}”` : 'Explore anime'}<span>.</span></h2></div>
          <form className="search-form" onSubmit={handleSearch}>
            <label className="search-wrap"><span className="search-icon">⌕</span><input type="search" placeholder="Search an anime title..." value={searchText} onChange={(event) => setSearchText(event.target.value)} aria-label="Search anime by title" /></label>
            <button className="search-button" type="submit">Search</button>
          </form>
        </div>

        {loading && <div className="message"><span className="spinner" />Finding anime for you...</div>}
        {!loading && error && <div className="message error-message">{error}</div>}
        {!loading && !error && visibleAnime.length === 0 && <div className="message">{showFavorites ? 'Your list is empty. Tap a heart on a show to save it.' : searchText ? `No anime results for “${searchText}”. Try another title.` : 'No anime found on this page yet.'}</div>}
        {!loading && !error && visibleAnime.length > 0 && <div className="anime-grid">{visibleAnime.map((item) => <AnimeCard key={item.id} anime={item} isFavorite={favorites.some((favorite) => favorite.id === item.id)} onToggleFavorite={toggleFavorite} />)}</div>}
        {!showFavorites && !activeSearch && !error && <div className="load-more-row"><button className="load-more-button" onClick={loadMore} disabled={loading || !hasMore}>{loading ? 'Loading…' : hasMore ? 'Load more anime' : 'You’re all caught up'}</button></div>}
      </section>

      <footer className="footer"><span>© Hujjat bin Maswood</span><span>Find a story you’ll love.</span><a href="https://www.tvmaze.com/" target="_blank" rel="noreferrer">SHOW DATA FROM TVMAZE</a></footer>
    </main>
  )
}

export default App
