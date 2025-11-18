import { useState } from "react";

export default function UploadForm({ onUpload }) {
  const [pdfFile, setPdfFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pdfFile) return alert("Please upload a PDF");

    onUpload(pdfFile, jobDesc);
  };

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label className="label">
        Upload CV (PDF):
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdfFile(e.target.files[0])}
        />
      </label>

      <label className="label">
        Job Description:
        <textarea
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
          placeholder="Paste job description here…"
          required
        />
      </label>

      <button className="btn" type="submit">
        Analyze Resume
      </button>
    </form>
  );
}
