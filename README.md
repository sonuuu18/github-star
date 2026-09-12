# ⭐ GitStar

Turn your GitHub repository stars into an animated, shareable video.

Paste a GitHub repository URL, and GitStar fetches its star count and generates a video you can download and share.

## 🎥 Demo
Uploading github-star-compressed.mp4…

## ✨ Features

* Paste a GitHub repository URL
* Fetch repository stars and details
* Display repository owner and contributors
* Generate an animated video
* Download the generated video

## 🚀 How It Works

```text
GitHub Repository URL
        ↓
   Fetch Repo Data
        ↓
     ⭐ Star Count
        ↓
   Canvas Animation
        ↓
   MediaRecorder
        ↓
    🎥 Video
        ↓
     Download
```

Video rendering happens directly in the browser using the Canvas API and `MediaRecorder`.

## 🛠️ Tech Stack

* **Next.js**
* **React**
* **TypeScript**
* **Supabase Edge Functions**
* **GitHub API**
* **HTML Canvas API**
* **MediaRecorder API**
* **WebM / MP4**

## 📦 Getting Started

### Clone

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

### Install

```bash
pnpm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run

```bash
pnpm dev
```

Open `http://localhost:3000` in your browser.

## 📄 License

MIT
