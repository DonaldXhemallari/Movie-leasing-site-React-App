import { useEffect } from "react";
import { useState } from "react";
import StarRating from "./starRating";

// Temporary movie data for initial rendering
const tempMovieData = [
  // ... (data omitted for brevity)
];

// Temporary watched movie data for initial rendering
const tempWatchedData = [
  // ... (data omitted for brevity)
];

// Function to calculate the average of an array
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "12b4fdd3";

// Main App component
export default function App() {
  // State variables
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState(tempMovieData);
  const [watched, setWatched] = useState(tempWatchedData);
  const [isLoading, setIsLoading] = useState("false");
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // Function to handle selecting a movie
  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  }

  // Function to close the selected movie details
  function handleCloseMovie() {
    setSelectedId(null);
  }

  // useEffect to fetch movies when the query changes
  useEffect(
    function () {
      async function getMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`
          );
          if (!res.ok) throw new Error("Failed to fetch");
          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie not found");
          setMovies(data.Search);
        } catch (err) {
          console.error(err.message);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }

      // If query length is less than 2, reset movies and error
      if (query.length < 2) {
        setMovies([]);
        setError("");
        return;
      }

      // Fetch movies based on the query
      getMovies();
    },
    [query]
  );

  return (
    <>
      {/* NavBar component */}
      <NavBar>
        {/* Search component */}
        <Search query={query} setQuery={setQuery} />
        {/* NumResults component */}
        <NumResults movies={movies} />
      </NavBar>

      {/* Main component */}
      <Main>
        {/* Box component for movies list and details */}
        <Box>
          {/* Loader component while movies are loading */}
          {isLoading && <Loader />}
          {/* MovieList component if no error and not loading */}
          {!isLoading && !error && (
            <MovieList movies={movies} onMovieSelect={handleSelectMovie} />
          )}
          {/* ErrorMessage component if there's an error */}
          {error && <ErrorMessage message={error} />}
        </Box>

        {/* Box component for selected movie details or watched movies summary and list */}
        <Box>
          {/* MovieDetails component if there's a selected movie, else WatchedSummary and WatchedMoviesList components */}
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
            />
          ) : (
            <>
              {/* WatchedSummary component */}
              <WatchedSummary watched={watched} />
              {/* WatchedMoviesList component */}
              <WatchedMoviesList watched={watched} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

// Loader component
function Loader() {
  return <p className="loader">Loading...</p>;
}

// ErrorMessage component
function ErrorMessage({ message }) {
  return <p className="error">{message}</p>;
}

// NavBar component
function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      {/* Logo component */}
      <Logo />
      {children}
    </nav>
  );
}

// Logo component
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

// Search component
function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

// NumResults component
function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

// Main component
function Main({ children }) {
  return <main className="main">{children}</main>;
}

// Box component
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}

// MovieList component
function MovieList({ movies, onMovieSelect }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onMovieSelect={onMovieSelect} />
      ))}
    </ul>
  );
}

// Movie component
function Movie({ movie, onMovieSelect }) {
  return (
    <li onClick={() => onMovieSelect(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

// MovieDetails component
function MovieDetails({ selectedId, onCloseMovie }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const {
    Title,
    Released,
    Director,
    Year,
    Poster,
    Genre,
    imdbRating,
    Runtime,
    Actors,
  } = movie;

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }

      getMovieDetails();
    },
    [selectedId]
  );

  return (
    <>
      {isLoading ? (
        <loader />
      ) : (
        <div className="details">
          <header>
            <button onClick={onCloseMovie} className="btn-back">
              &larr;
            </button>
            <img src={Poster} alt="Poster" />
            <div className="details-overview">
              <h2>{Title}</h2>
              <p>
                {Released} &bull; {Runtime}
              </p>
              <p>{Genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} Imdb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {/* StarRating component */}
              <StarRating maxRating={10} size={24} />
            </div>
            <p>
              <span>🎥</span>
              Drected by : {Director}
            </p>
            <p>
              <span>🧑‍🎤</span>
              Starring : {Actors}
            </p>
          </section>
        </div>
      )}
    </>
  );
}

// WatchedSummary component
function WatchedSummary({ watched }) {
  // Calculate average ratings and runtime for watched movies
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

// WatchedMoviesList component
function WatchedMoviesList({ watched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        // WatchedMovie component
        <WatchedMovie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

// WatchedMovie component
function WatchedMovie({ movie }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}
