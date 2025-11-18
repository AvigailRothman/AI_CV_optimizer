export default function ResultBox({ result }) {
  const { pdfUrl, jobDescription } = result;

  return (
    <div className="result-box">
      <h2>Resume Optimized Successfully ✔</h2>

      <p>
        Your resume has been rewritten and adapted to the job description.
        You can now download the updated PDF below:
      </p>

      <a className="download-btn" href={pdfUrl} download>
        ⬇ Download Updated PDF
      </a>

      {/* אם תרצי, אפשר גם להציג את כותרת המשרה בחיוך */}
      <p style={{ marginTop: "20px", fontWeight: "bold" }}>
        Matched Job Title: {jobDescription.matchedTitle}
      </p>
    </div>
  );
}
