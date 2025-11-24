import { useState } from "react";
import UploadForm from "./components/UploadForm";
import ResultBox from "./components/ResultBox";
import "./App.css";

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [stepMessage, setStepMessage] = useState("");

  const handleUpload = async (pdfFile, jobDesc) => {
    setIsLoading(true);
    setResult(null);
    setStepMessage("📄 Step 1: Uploading your PDF…");

    const formData = new FormData();
    // 👇 חייב להתאים ל-upload.single("cv") בשרת
    formData.append("cv", pdfFile);
    // 👇 חייב להתאים ל-req.body.jobDescription
    formData.append("jobDescription", jobDesc);

    try {
      // 👇 הנתיב צריך להתאים לשרת שלך
      // אם השרת מדפיס "Server is running on http://localhost:3001" – תשאירי 3001
      const response = await fetch("http://localhost:3001/api/optimize-for-job", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error (${response.status}): ${text}`);
      }

      const data = await response.json();
      // data = { analysis: {...}, pdfFilename: "optimized-....pdf" }
      setStepMessage("🤖 Step 2: Processing finished!");
      setResult(data);
    } catch (err) {
      setStepMessage("❌ Error during processing: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="wrapper-card">
      <h1>CV → Job Matcher</h1>

      {/* טופס */}
      <UploadForm onUpload={handleUpload} />

      {/* לודר */}
      {isLoading && (
        <>
          <div className="loader"></div>
          <div className="loading-text">Processing your CV… Please wait…</div>
        </>
      )}

      {/* הודעות */}
      {stepMessage && !isLoading && (
        <p className="status">{stepMessage}</p>
      )}

      {/* תוצאה */}
      {result && !isLoading && (
        <ResultBox result={result} />
      )}
    </div>
  );
}