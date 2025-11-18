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
    formData.append("pdf", pdfFile);
    formData.append("jobDescription", jobDesc);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Server error – something went wrong.");
      }

      const data = await response.json();
      setStepMessage("🤖 Step 2: Processing finished!");
      setResult(data);

    } catch (err) {
      setStepMessage("❌ Error during processing: " + err.message);

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="wrapper-card">   {/* ←← מסגרת כללית חדשה */}

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
