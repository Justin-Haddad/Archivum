function NewsCard({ article }) {
  if (!article) return null

  return (
    <div className="discover-news-card">
      <div className="discover-news-card-content">
        <h3 className="discover-news-card-title">{article.title || 'News Article'}</h3>
        <p className="discover-news-card-excerpt">
          {article.excerpt || article.description || 'Stay updated with the latest news and updates.'}
        </p>
        <div className="discover-news-card-meta">
          {article.source && <span className="discover-news-card-source">{article.source}</span>}
          {article.date && <span className="discover-news-card-date">{article.date}</span>}
        </div>
      </div>
      {article.image && (
        <div className="discover-news-card-image">
          <img src={article.image} alt={article.title} />
        </div>
      )}
    </div>
  )
}

export default NewsCard

