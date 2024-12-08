import React, { useEffect, useState } from "react";
import axios from "axios";
import "../App.css"; // Ensure the CSS file is imported

const FeedbackList = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch the last 10 feedback submissions
    const fetchFeedback = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/get_last_n_feedback?n=10");
        setFeedback(response.data.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch feedback. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  if (loading) return <div>Loading feedback...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h1>Last 10 Feedback Submissions</h1>
      {feedback.length === 0 ? (
        <div>No feedback available.</div>
      ) : (
        <div className="scrollable-list">
          <ul className="list-group">
            {feedback.map((fb, index) => (
              <li key={index} className="list-group-item">
                <strong>ID:</strong> {fb.id} <br />
                <strong>Content:</strong> {fb.content} <br />
                <strong>Rating:</strong> {fb.rating} <br />
                <strong>Comment:</strong> {fb.comment || "No comment"} <br />
                <strong>Timestamp:</strong> {fb.timestamp} <br />
              </li>
            ))}
          </ul>
        </div>
      )}
      <a href="/feedback/all" className="btn btn-link mt-3">
        See All Feedback
      </a>
    </div>
  );
};

export default FeedbackList;
