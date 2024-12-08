import React, { useEffect, useState } from "react";
import axios from "axios";
import "../App.css"; // Ensure the CSS file is imported

const AllFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch all feedback submissions
    const fetchAllFeedback = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:10000/get_last_n_feedback?n=100"); // Adjust limit as needed
        setFeedback(response.data.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch all feedback. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllFeedback();
  }, []);

  if (loading) return <div>Loading feedback...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h1>All Feedback Submissions</h1>
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
    </div>
  );
};

export default AllFeedback;
