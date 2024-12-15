import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import ReactMarkdown from "react-markdown";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AllFeedback from "./components/AllFeedback";
import { findNonConformances, getInsights, addFeedback } from "./services/api";

const App = () => {
  const [topics, setTopics] = useState("");
  const [numRows, setNumRows] = useState(10); // Default number of rows
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeCluster, setActiveCluster] = useState("");
  const [questions, setQuestions] = useState({});
  const [insights, setInsights] = useState({});
  const [toastMessage, setToastMessage] = useState("");
  const [loadingClusters, setLoadingClusters] = useState({});
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const insightsRef = useRef(null);
  // Updated Feedback State
const [feedbacks, setFeedbacks] = useState({});
const [ratings, setRatings] = useState({}); // State for ratings
  useEffect(() => {
    if (insightsRef.current) {
      insightsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [insights]);

  // Updated handleFeedbackChange
const handleFeedbackChange = (cluster, feedback) => {
  setFeedbacks((prev) => ({ ...prev, [cluster]: feedback }));
};

// New handleRatingChange
const handleRatingChange = (cluster, rating) => {
  setRatings((prev) => ({ ...prev, [cluster]: rating }));
};
  const handleInputChange = (e) => setTopics(e.target.value);

  const handleNumRowsChange = (e) => setNumRows(parseInt(e.target.value, 10));

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleCluster = async () => {
    setLoading(true);
    setError("");
    setResults({});
    setActiveCluster("");

    const topicsArray = topics.split(",").map((topic) => topic.trim());
    if (topicsArray.length === 0) {
      setError("Please enter valid topics.");
      setLoading(false);
      return;
    }

    const payload = {
      topics: topicsArray,
      numrows: numRows,
    };

    try {
      const response = await findNonConformances(payload);
      if (!Array.isArray(response.data.results) || response.data.results.length === 0) {
        setError("No data found for the provided topics. Try different topics.");
        setLoading(false);
        return;
      }

      const transformedResults = response.data.results.reduce((acc, topicData) => {
        if (topicData.topic) {
          acc[topicData.topic] = topicData.rows || [];
        }
        return acc;
      }, {});

      setResults(transformedResults);
      setActiveCluster(topicsArray[0]); // Set the first topic as the active cluster
    } catch (err) {
      setError("An error occurred while fetching data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionChange = (cluster, question) => {
    setQuestions((prev) => ({ ...prev, [cluster]: question }));
  };
  
  const handleGetInsights = async (cluster) => {
    const question = questions[cluster];
    if (!question || question.trim() === "") {
      alert("Please enter a question.");
      return;
    }

    const rows = results[cluster];
    if (!Array.isArray(rows) || rows.length === 0) {
      alert("No data available for this cluster to analyze insights.");
      return;
    }

    const payload = {
      context: JSON.stringify(rows),
      question: question,
      model: "wizardlm2",
    };

    setLoadingClusters((prev) => ({ ...prev, [cluster]: true }));
    try {
      const response = await getInsights(payload);
      setInsights((prev) => ({ ...prev, [cluster]: response.data.insights }));
      showToast("Insights fetched successfully!");
    } catch (err) {
      setInsights((prev) => ({
        ...prev,
        [cluster]: "An error occurred while fetching insights. Please try again.",
      }));
    } finally {
      setLoadingClusters((prev) => ({ ...prev, [cluster]: false }));
    }
  };

  const handleFeedbackSubmit = async (cluster) => {
    try {
      const feedbackPayload = {
        content: insights[cluster], // Insight content
        rating: ratings[cluster],  // Rating provided by the user
        comment: feedbacks[cluster].trim(), // Feedback comment
      };
      await addFeedback(feedbackPayload);
      showToast("Feedback submitted successfully!");
      setFeedbackVisible(false);
      setFeedbacks((prev) => ({ ...prev, [cluster]: "" })); // Clear feedback for the cluster
      setRatings((prev) => ({ ...prev, [cluster]: "" }));
    } catch (err) {
      showToast("Error submitting feedback. Please try again.");
    }
  };

  return (
    <Router>
      <div>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container">
           
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" to="/">
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/feedback/all">
                    All Feedback
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="container mt-4">
          <Routes>
            <Route
              path="/"
              element={
                <div>
                  <h1 className="text-center mb-4">Cluster Non-Conformances</h1>
                  <div className="d-flex align-items-center mb-3">
                    <div className="flex-grow-1">
                      <label htmlFor="topicsInput" className="form-label">
                        Topics (Comma Separated)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="topicsInput"
                        placeholder="Enter topics (e.g., Leak, Damage)"
                        value={topics}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="ms-3">
                      <label htmlFor="numRowsSelect" className="form-label">
                        Rows
                      </label>
                      <select
                        className="form-select"
                        id="numRowsSelect"
                        value={numRows}
                        onChange={handleNumRowsChange}
                        style={{ width: "100px" }}
                      >
                        {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary w-100 mb-3"
                    onClick={handleCluster}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    ) : null}
                    {loading ? "Clustering..." : "Cluster"}
                  </button>

                  {error && <div className="alert alert-danger">{error}</div>}

                  <ul className="nav nav-tabs">
                    {Object.keys(results).map((cluster) => (
                      <li key={cluster} className="nav-item">
                        <button
                          className={`nav-link ${activeCluster === cluster ? "active" : ""}`}
                          onClick={() => setActiveCluster(cluster)}
                        >
                          {cluster}
                        </button>
                      </li>
                    ))}
                  </ul>

                  {activeCluster && results[activeCluster]?.length > 0 ? (
                    <div
                      className="mt-4 border p-3"
                      style={{ maxHeight: "450px", overflowY: "scroll" }}
                    >
                      {results[activeCluster].map((row, index) => (
                        <div
                          key={index}
                          className="card mb-2 shadow-sm"
                          style={{
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            padding: "10px",
                          }}
                        >
                          <div className="card-body">
                            <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                              {row.NonconformanceDescription}
                            </p>
                            <div style={{ fontSize: "0.9rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                      <p>
                                        <strong>Nonconformance Number:</strong> {row.NonconformanceNumber}
                                      </p>
                                      <p>
                                        <strong>Supplier Name:</strong> {row.SupplierName}
                                      </p>
                                      <p>
                                        <strong>Part Name:</strong> {row.PartName}
                                      </p>
                                      <p>
                                        <strong>Part Number:</strong> {row.PartNumber}
                                      </p>
                                      <p>
                                        <strong>Site Name:</strong> {row.SiteName}
                                      </p>
                                      <p>
                                        {row._distance && (
                                          <>
                                            {row._distance}
                                          </>
                                        )}
                                      </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    activeCluster && <div>No non-conformances available.</div>
                  )}

                  <div style={{ marginTop: "30px" }}></div>

                  <h4>Get further insights into non-conformance in cluster {activeCluster}</h4>
                  <textarea
                    className="form-control mb-3"
                    rows="3"
                    placeholder={`Ask a question about ${activeCluster}`}
                    value={questions[activeCluster] || ""}
                    onChange={(e) => handleQuestionChange(activeCluster, e.target.value)}
                  />
                  <button
                    className="btn btn-secondary mb-3"
                    onClick={() => handleGetInsights(activeCluster)}
                    disabled={loadingClusters[activeCluster]}
                  >
                    {loadingClusters[activeCluster] ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Fetching Insights...
                      </>
                    ) : (
                      "Get Insights"
                    )}
                  </button>

                  {insights[activeCluster] && (
                    <div className="border p-3 mt-3">
                      <ReactMarkdown>{insights[activeCluster]}</ReactMarkdown>
                      <button
                        className="btn btn-outline-secondary btn-sm mt-2"
                        onClick={() => setFeedbackVisible(true)}
                      >
                        Provide Feedback
                      </button>
                      <div ref={insightsRef}></div>
                    </div>
                  )}

                    {feedbackVisible && (
                      <div
                        className="position-fixed bg-light shadow p-3"
                        style={{
                          width: "400px",
                          right: 0,
                          top: 0,
                          zIndex: 1050,
                        }}
                      >
                        <h5>Provide Feedback</h5>
                        <textarea
                          className="form-control mb-3"
                          placeholder="Write your feedback here..."
                          rows={5}
                          value={feedbacks[activeCluster] || ""}
                          onChange={(e) => handleFeedbackChange(activeCluster, e.target.value)}
                        />
                        <label htmlFor="ratingSelect" className="form-label">Rating</label>
                        <select
                          className="form-select mb-3"
                          id="ratingSelect"
                          value={ratings[activeCluster] || ""}
                          onChange={(e) => handleRatingChange(activeCluster, e.target.value)}
                        >
                          <option value="" disabled>Select a rating</option>
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <option key={rating} value={rating}>
                              {rating}
                            </option>
                          ))}
                        </select>
                        <button
                          className="btn btn-primary w-100"
                          onClick={() => handleFeedbackSubmit(activeCluster)}
                        >
                          Submit Feedback
                        </button>
                        <button
                          className="btn btn-secondary w-100 mt-2"
                          onClick={() => setFeedbackVisible(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                </div>
              }
            />
            <Route path="/feedback/all" element={<AllFeedback />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;