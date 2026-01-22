function FilterChips({ filters, activeFilter, onFilterChange, genres = [], onGenreChange, activeGenres = [] }) {
  return (
    <div className="discover-filters">
      <div className="discover-filter-chips">
        {filters.map(filter => (
          <button
            key={filter.value}
            className={`discover-filter-chip ${activeFilter === filter.value ? 'active' : ''}`}
            onClick={() => onFilterChange(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>
      {genres.length > 0 && (
        <div className="discover-genre-chips">
          {genres.map(genre => (
            <button
              key={genre.value || genre}
              className={`discover-genre-chip ${activeGenres.includes(genre.value || genre) ? 'active' : ''}`}
              onClick={() => onGenreChange(genre.value || genre)}
            >
              {genre.label || genre}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default FilterChips

