import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ArticleCard from "../components/ArticleCard";
import { api } from "../services/api";
import "./AllArticles.css";

function AllArticles() {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadArticles = async () => {
      setIsLoading(true);
      setError("");

      try {
        // Build query params for title search and status filter
        const queryParams = new URLSearchParams();

        if (searchTerm.trim()) {
          queryParams.set("keyword", searchTerm.trim());
        }

        if (statusFilter) {
          queryParams.set("status", statusFilter);
        }

        const data = await api.getAllArticles(queryParams.toString());
        setArticles(data);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadArticles();
  }, [searchTerm, statusFilter]);

  const updateArticleInState = (articleId, newStatus) => {
    setArticles((currentArticles) =>
      currentArticles.map((article) =>
        article._id === articleId ? { ...article, status: newStatus } : article
      )
    );
  };

  const handleReadNow = async (articleId, articleUrl) => {
    try {
      // Open the article and mark it as reading
      window.open(articleUrl, "_blank", "noopener,noreferrer");
      await api.updateArticleStatus(articleId, "reading");
      updateArticleInState(articleId, "reading");
    } catch (actionError) {
      setError(actionError.message);
    }
  };

  const handleSchedule = async (articleId) => {
    try {
      await api.updateArticleStatus(articleId, "scheduled");
      updateArticleInState(articleId, "scheduled");
    } catch (actionError) {
      setError(actionError.message);
    }
  };

  const handleDelete = async (articleId) => {
    try {
      await api.deleteArticle(articleId);
      setArticles((currentArticles) =>
        currentArticles.filter((article) => article._id !== articleId)
      );
    } catch (actionError) {
      setError(actionError.message);
    }
  };

  return (
    <section className="page-section">
      <div className="page-shell all-articles-layout">
        <Sidebar />

        <div className="all-articles-panel">
          <div className="page-header">
            <p className="page-label">All Articles</p>
            <h2>Your saved reading library</h2>
            <p className="page-text">
              Browse every saved article, search by title, and filter by
              reading status in one clean view.
            </p>
          </div>

          <div className="all-articles-toolbar">
            <input
              type="text"
              className="article-search"
              placeholder="Search by title"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <select
              className="article-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">All Status</option>
              <option value="saved">Saved</option>
              <option value="reading">Reading</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="all-articles-content">
            {isLoading ? (
              <div className="all-articles-message">Loading articles...</div>
            ) : null}

            {!isLoading && error ? (
              <div className="all-articles-message all-articles-error">
                {error}
              </div>
            ) : null}

            {!isLoading && !error && articles.length === 0 ? (
              <div className="all-articles-message">
                No articles matched your search.
              </div>
            ) : null}

            {!isLoading && !error && articles.length > 0 ? (
              <div className="articles-grid">
                {articles.map((article) => (
                  <ArticleCard
                    key={article._id}
                    id={article._id}
                    title={article.title}
                    url={article.url}
                    readingTime={article.readingTime}
                    status={article.status}
                    onReadNow={handleReadNow}
                    onSchedule={handleSchedule}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AllArticles;
