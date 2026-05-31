# 🛡️ DeepScan — AI-Powered Deepfake Detection

> Expose synthetic media with surgical precision. DeepScan uses state-of-the-art AI to detect deepfakes in images and videos within seconds.

🔗 **Live Demo:** [https://deepfake-app-pbxt.onrender.com](https://deepfake-app-pbxt.onrender.com)

---

## ✨ Features

- 🖼️ **Image Analysis** — Upload any photo and instantly determine if it's authentic or AI-generated
- 🎥 **Video Analysis** — Frame-by-frame deepfake detection across entire video clips
- 🔐 **Secure Authentication** — Email verification, JWT sessions via NextAuth.js
- 🪙 **Credit System** — Each analysis costs 1 credit, users start with 10
- 👤 **User Profiles** — Manage your account and track remaining credits
- 📧 **Email Verification** — Transactional emails via Brevo

---

## 🧠 How It Works

1. **Upload** — Drop an image or video into DeepScan
2. **Analyze** — Our AI model scans for pixel-level deepfake patterns
3. **Verdict** — Receive a clear **Real** or **Fake** result in seconds

For videos, DeepScan extracts frames every 2 seconds (up to 10 frames), runs each through the detection model, and returns a majority-vote verdict.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes |
| Database | MongoDB + Mongoose |
| Authentication | NextAuth.js (JWT + Credentials) |
| File Storage | Cloudinary |
| AI Model | Hugging Face — `prithivMLmods/deepfake-detector-model-v1` |
| Email | Brevo (Sendinblue) |
| Deployment | Render |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Hugging Face account
- Brevo account

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/deepfake-app.git
cd deepfake-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
HF_TOKEN=your_huggingface_token
BREVO_API_KEY=your_brevo_api_key
SENDER_EMAIL=your_sender_email
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   └── verify/
│   ├── (app)/
│   │   ├── image-check/
│   │   ├── video-check/
│   │   └── profile/
│   ├── api/
│   │   ├── auth/
│   │   ├── sign-up/
│   │   ├── verify-code/
│   │   ├── check-username/
│   │   ├── image-check/
│   │   ├── video-check/
│   │   └── profile/
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── Navbar.tsx
│   └── Providers.tsx
├── models/
│   ├── user.model.ts
│   ├── image.model.ts
│   └── video.model.ts
├── schemas/
├── types/
├── utils/
└── lib/
```

---

## 🔌 API Routes

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/sign-up` | Register a new user | ❌ |
| POST | `/api/verify-code` | Verify email with OTP | ❌ |
| GET | `/api/check-username` | Check username availability | ❌ |
| POST | `/api/auth/[...nextauth]` | NextAuth handlers | ❌ |
| POST | `/api/image-check` | Analyze image for deepfake | ✅ |
| POST | `/api/video-check` | Analyze video for deepfake | ✅ |
| PUT | `/api/profile` | Update username | ✅ |

---

## 🤖 AI Model

DeepScan uses [`prithivMLmods/deepfake-detector-model-v1`](https://huggingface.co/prithivMLmods/deepfake-detector-model-v1) via the Hugging Face Inference API.

- **Accuracy:** ~94%
- **Input:** Raw image buffer (JPEG)
- **Output:** `[{ label: "Fake" | "Real", score: number }]`

---

## 📦 Deployment

The app is deployed on **Render** as a web service.

```bash
# Build
npm run build

# Start
npm run start
```

---

## 🙌 Acknowledgements

- [Hugging Face](https://huggingface.co) for the deepfake detection model
- [Cloudinary](https://cloudinary.com) for media storage
- [shadcn/ui](https://ui.shadcn.com) for the component library
- [NextAuth.js](https://next-auth.js.org) for authentication

---

## 📄 License

MIT License — feel free to use, modify, and distribute.
