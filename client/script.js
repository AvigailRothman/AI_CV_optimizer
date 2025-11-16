document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = document.getElementById("pdf").files[0];
  const jobDesc = document.getElementById("jobDesc").value;

  const formData = new FormData();
  formData.append("pdf", file);
  formData.append("jobDescription", jobDesc);

  const res = await fetch("http://localhost:5000/upload", {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  console.log(data);

  document.getElementById("result").innerHTML = `
    <h2>Matched Title: ${data.jobDescription.matchedTitle}</h2>
     <pre>${JSON.stringify(data.jobDescription, null, 2)}</pre>
     <a href="${data.pdfUrl}" download>Download New PDF</a>
  `;
});
