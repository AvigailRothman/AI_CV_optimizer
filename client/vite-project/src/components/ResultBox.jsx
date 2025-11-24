import React from "react";

export default function ResultBox({ result }) {
  if (!result) return null;

  // השרת מחזיר:
  // { analysis: {...}, pdfFilename: "optimized-...pdf" }
  const { analysis, pdfFilename } = result;

  if (!analysis) {
    return (
      <div className="result-box">
        <p>No analysis received from server.</p>
      </div>
    );
  }

  const {
    matchScore,
    skillsToHighlight = [],
    suggestedChanges = [],
    missingSkills = [],
    specificRecommendations = [],
  } = analysis;

  const handleDownload = () => {
    if (!pdfFilename) return;
    window.open(
      `http://localhost:3001/api/download/${pdfFilename}`,
      "_blank"
    );
  };

  return (
    <div className="result-box">
      <h2>Analysis Results</h2>

      {typeof matchScore === "number" && (
        <p>
          <strong>Match score:</strong> {matchScore}/100
        </p>
      )}

      {skillsToHighlight.length > 0 && (
        <section>
          <h3>Skills to Highlight</h3>
          <ul>
            {skillsToHighlight.map((skill, idx) => (
              <li key={idx}><strong>{skill}</strong></li>  // או className מודגש
            ))}
          </ul>
        </section>
      )}

      {missingSkills.length > 0 && (
        <section>
          <h3>Missing / Weak Skills</h3>
          <ul>
            {missingSkills.map((skill, idx) => (
              <li key={idx}>{skill}</li>
            ))}
          </ul>
        </section>
      )}

      {suggestedChanges.length > 0 && (
        <section>
          <h3>Suggested Changes</h3>
          <ul>
            {suggestedChanges.map((change, idx) => (
              <li key={idx}>{change}</li>
            ))}
          </ul>
        </section>
      )}

      {specificRecommendations.length > 0 && (
        <section>
          <h3>Specific Recommendations</h3>
          <ul>
            {specificRecommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </section>
      )}

      {pdfFilename && (
        <button onClick={handleDownload}>
          Download optimized CV (PDF)
        </button>
      )}
    </div>
  );
}