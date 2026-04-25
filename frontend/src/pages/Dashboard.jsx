import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ArticleCard from "../components/ArticleCard";
import { api } from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadArticles = async () => {
      try {
        // Fetch the smart queue from the backend
        const data = await api.getArticles();

        // Keep the queue short and focused by showing at most 5 articles
        setArticles(data.slice(0, 5));
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadArticles();
  }, []);

  const updateArticleInState = (articleId, newStatus) => {
    setArticles((currentArticles) =>
      currentArticles.map((article) =>
        article._id === articleId ? { ...article, status: newStatus } : article
      )
    );
  };

  const handleReadNow = async (articleId, articleUrl) => {
    try {
      // Open the article first, then mark it as currently reading
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
      <div className="page-shell dashboard-layout">
        <Sidebar />

        <main className="dashboard-content">
          <section className="dashboard-panel">
            <div className="page-header">
              <p className="page-label">Dashboard</p>
              <h2>Your Reading Queue</h2>
              <p className="page-text">
                Your smart queue brings forward the next few articles to focus
                on, so your reading list stays simple and manageable.
              </p>
            </div>

            <div className="dashboard-summary">
              <div className="summary-card">
                <span>Queue Size</span>
                <strong>{articles.length}</strong>
              </div>
             </div>

            <div className="article-list">
              {isLoading ? (
                <div className="dashboard-message">Loading your queue...</div>
              ) : null}

              {!isLoading && error ? (
                <div className="dashboard-message dashboard-error">{error}</div>
              ) : null}

              {!isLoading && !error && articles.length === 0 ? (
                <div className="dashboard-message">
                  No articles found in your reading queue yet.
                </div>
              ) : null}

              {!isLoading && !error
                ? articles.map((article) => (
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
                  ))
                : null}
            </div>
          </section>
        </main>
      </div>
    </section>
  );
}

export default Dashboard;
