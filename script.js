// ======================
// Agent Classes
// ======================

class ReaderAgent {
  async read(input, file = null) {
    try {
      if (file) {
        return await this.readFile(file);
      }

      const urlPattern = /^https?:\/\//;
      if (input.trim() && urlPattern.test(input.trim())) {
        const response = await fetch('/proxy?url=' + encodeURIComponent(input));
        const text = await response.text();
        return this.extractText(text);
      } else if (input.trim()) {
        return input.trim();
      } else {
        throw new Error("No valid input provided");
      }
    } catch (err) {
      throw new Error("Failed to read content: " + err.message);
    }
  }

  async readFile(file) {
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File too large. Max 10MB allowed.");
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          if (file.type === 'application/pdf') {
            const typedarray = new Uint8Array(e.target.result);
            const text = await this.readPdf(typedarray);
            resolve(text);
          } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            resolve(e.target.result);
          } else {
            reject(new Error("Unsupported file type. Use .txt or .pdf"));
          }
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));

      if (file.type === 'application/pdf') {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  }

  extractText(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  }

  async readPdf(pdfData) {
    try {
      const loadingTask = pdfjsLib.getDocument({ data: pdfData });
      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {  // Limit to 20 pages
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + ' ';
      }

      return fullText.trim();
    } catch (err) {
      throw new Error("Error parsing PDF: " + err.message);
    }
  }
}

class SummarizerAgent {
  async summarize(text) {
    if (!text || text.length < 10) {
      throw new Error("Not enough content to summarize");
    }

    const truncatedText = text.substring(0, 8000);

    const prompt = `
You are a helpful summarizer. Provide a clear, concise summary of the following text in 3-5 sentences.

Text:
"${truncatedText}"

Summary:
`.trim();

    try {
      const response = await fetch('http://localhost:1234/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'local-model',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.6,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`LLM API error: ${response.status} ${error.error?.message || ''}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        throw new Error("Cannot connect to LM Studio. Make sure it's running on http://localhost:1234");
      }
      throw err;
    }
  }
}

// ======================
// DOM Elements
// ======================
const inputEl = document.getElementById('inputContent');
const fileInputEl = document.getElementById('fileInput');
const btnEl = document.getElementById('summarizeBtn');
const statusEl = document.getElementById('status');
const outputEl = document.getElementById('output');
const summaryEl = document.getElementById('summaryText');

// ======================
// Initialize Agents
// ======================
const reader = new ReaderAgent();
const summarizer = new SummarizerAgent();

let uploadedFile = null;

// ======================
// Event Listeners
// ======================

fileInputEl.addEventListener('change', (e) => {
  uploadedFile = e.target.files[0] || null;
  if (uploadedFile) {
    inputEl.value = ''; // Clear textarea when file is selected
    statusEl.textContent = `📎 File loaded: ${uploadedFile.name}`;
  }
});

btnEl.addEventListener('click', async () => {
  const input = inputEl.value;

  if (!input && !uploadedFile) {
    alert('Please enter text/URL or upload a file.');
    return;
  }

  // Reset UI
  statusEl.textContent = '';
  outputEl.classList.add('hidden');
  summaryEl.textContent = '';

  try {
    let content = '';

    if (uploadedFile) {
      statusEl.textContent = `📄 Agent 1: Reading "${uploadedFile.name}"...`;
      content = await reader.read('', uploadedFile);
      uploadedFile = null; // reset after use
      fileInputEl.value = ''; // clear input
    } else {
      statusEl.textContent = input.trim().startsWith('http')
        ? '🔍 Agent 1: Fetching web content...'
        : '📖 Agent 1: Processing text...';
      content = await reader.read(input);
    }

    if (!content || content.length < 10) {
      throw new Error('No readable content found.');
    }

    statusEl.textContent = '🧠 Agent 2: Generating summary with local LLM...';
    const summary = await summarizer.summarize(content);

    // Display result
    summaryEl.textContent = summary;
    outputEl.classList.remove('hidden');
    statusEl.textContent = '✅ Done!';

  } catch (err) {
    console.error(err);
    statusEl.textContent = `❌ Error: ${err.message}`;
  }
});