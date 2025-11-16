// document.getElementById("uploadForm").addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const file = document.getElementById("pdf").files[0];
//   const jobDesc = document.getElementById("jobDesc").value;

//   const formData = new FormData();
//   formData.append("pdf", file);
//   formData.append("jobDescription", jobDesc);

//   const res = await fetch("http://localhost:5000/upload", {
//     method: "POST",
//     body: formData
//   });

//   const data = await res.json();
//   console.log(data);

//   document.getElementById("result").innerHTML = `
//     <h2>Matched Title: ${data.jobDescription.matchedTitle}</h2>
//      <pre>${JSON.stringify(data.jobDescription, null, 2)}</pre>
//      <a href="${data.pdfUrl}" download>Download New PDF</a>
//   `;
// });
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // לא שולחים כבקשה רגילה, רק עם JS

  // הצגת הודעה שהשלב התחיל
  document.getElementById("result").innerHTML = "<h3>שלב 1: טוענים את קובץ ה-PDF...</h3>";

  const file = document.getElementById("pdf").files[0];
  const jobDesc = document.getElementById("jobDesc").value;

  const formData = new FormData();
  formData.append("pdf", file);
  formData.append("jobDescription", jobDesc);

  // שליחה לשרת
  try {
    const res = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error('Something went wrong with the server!');
    }

    const data = await res.json();

    // הצגת שלב 2 - קיבלת תוצאה מהשרת
    document.getElementById("result").innerHTML = `
      <h3>שלב 2: קיבלנו את התשובה מהשרת...</h3>
      <h2>Matched Title: ${data.jobDescription.matchedTitle}</h2>
      <pre>${JSON.stringify(data.jobDescription, null, 2)}</pre>
      <a href="${data.pdfUrl}" download>Download New PDF</a>
    `;
  } catch (error) {
    // הצגת הודעת שגיאה אם משהו השתבש
    document.getElementById("result").innerHTML = `
      <h3>שגיאה במהלך התהליך:</h3>
      <p>${error.message}</p>
    `;
  }
});
