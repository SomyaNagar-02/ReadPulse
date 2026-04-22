import "./ArticleCard.css";

function ArticleCard({
  id,
  title,
  url,
  readingTime,
  status,
  onReadNow,
  onSchedule,
  onDelete
}) {
  return (
    <article className="article-card">
      <div className="article-card-header">
        <p className="article-status">{status}</p>
      </div>

      <h3 className="article-title">{title}</h3>
      <p className="article-meta">{readingTime} min read</p>

      <div className="article-actions">
        <button
          type="button"
          className="article-button article-button-primary"
          onClick={() => onReadNow(id, url)}
        >
          Read Now
        </button>

        <button
          type="button"
          className="article-button article-button-secondary"
          onClick={() => onSchedule(id)}
        >
          Schedule
        </button>

        <button
          type="button"
          className="article-button article-button-danger"
          onClick={() => onDelete(id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default ArticleCard;
