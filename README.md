# 🤖 Multi-Agent AI Summarizer with LM Studio

A fully local, privacy-first AI application that uses **multi-agent collaboration** to read and summarize content from:

- 📄 Text input  
- 🔗 Web URLs  
- 📂 `.txt` files  
- 📚 `.pdf` files  

All powered by a **local LLM** via [LM Studio](https://lmstudio.ai ), with no data sent to the cloud. 
Built using HTML, JavaScript, Tailwind CSS, and a lightweight Node.js proxy.


## 🌟 Features

✅ **No Internet Required for LLM** – Runs entirely on your machine  
✅ **Two Collaborative Agents**:
- **Reader Agent**: Fetches or parses text from any source
- **Summarizer Agent**: Uses your local LLM to generate concise summaries  
✅ **Supports Multiple Inputs**:
- Paste long text or articles
- Enter any public URL
- Upload `.txt` or `.pdf` files (parsed client-side)  
✅ **Privacy Focused** – Your documents never leave your computer  
✅ **Offline-Capable UI** – Only requires internet if fetching URLs  
✅ **Beautiful UI** – Powered by [Tailwind CSS]( https://tailwindcss.com )

> 💡 Powered by LM Studio’s OpenAI-compatible local server (`http://localhost:1234`)

---

## 🧰 Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | HTML, JavaScript, Tailwind CSS (CDN) |
| PDF Parsing | [PDF.js](https://mozilla.github.io/pdf.js/ ) |
| Local LLM | [LM Studio](https://lmstudio.ai ) |
| Backend Proxy | Node.js + Express (to bypass CORS) |
| LLM API | OpenAI-compatible endpoint |

---

## 🚀 How to Run Locally

### 1. Prerequisites

- [Node.js](https://nodejs.org ) (v16 or higher)
- [LM Studio](https://lmstudio.ai ) installed
- A locally runnable LLM (e.g., `Mistral`, `Llama 3`, `Phi-3` in GGUF format)

### 2. Clone the Repository

```bash
git clone https://github.com/asriomar/multi-agent-summarizer.git 
cd multi-agent-summarizer
