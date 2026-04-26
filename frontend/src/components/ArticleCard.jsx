import { useState } from "react";
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
  const [showScheduleOptions, setShowScheduleOptions] = useState(false);
  const [customDateTime, setCustomDateTime] = useState("");

  const buildFutureDate = (minutesFromNow) => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + minutesFromNow);
    return date.toISOString();
  };

  const handleQuickSchedule = async (minutesFromNow) => {
    await onSchedule(id, buildFutureDate(minutesFromNow));
    setShowScheduleOptions(false);
    setCustomDateTime("");
  };

  const handleCustomSchedule = async () => {
    if (!customDateTime) {
      return;
    }

    await onSchedule(id, new Date(customDateTime).toISOString());
    setShowScheduleOptions(false);
    setCustomDateTime("");
  };

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
          onClick={() => setShowScheduleOptions((currentValue) => !currentValue)}
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

      {showScheduleOptions ? (
        <div className="schedule-panel">
          <p className="schedule-title">Schedule this article</p>

          <div className="schedule-options">
            <button
              type="button"
              className="schedule-option-button"
              onClick={() => handleQuickSchedule(10)}
            >
              Remind me in 10 minutes
            </button>

            <button
              type="button"
              className="schedule-option-button"
              onClick={() => handleQuickSchedule(180)}
            >
              Later today
            </button>

            <button
              type="button"
              className="schedule-option-button"
              onClick={() => handleQuickSchedule(1440)}
            >
              Tomorrow
            </button>
          </div>

          <div className="schedule-custom">
            <input
              type="datetime-local"
              value={customDateTime}
              onChange={(event) => setCustomDateTime(event.target.value)}
            />
            <button
              type="button"
              className="schedule-confirm-button"
              onClick={handleCustomSchedule}
            >
              Confirm
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default ArticleCard;
