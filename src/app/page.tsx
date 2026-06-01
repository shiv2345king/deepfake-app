'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '../components/ui/button';
import { ShieldCheck, ImageIcon, Video, ArrowRight, Zap } from 'lucide-react';

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a1040_0%,_#0a0a1a_60%)] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">

        {/* Hero Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20 shadow-lg shadow-blue-900/20">
            <ShieldCheck className="w-10 h-10 text-blue-400" />
          </div>
        </div>

        {/* Hero Heading */}
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Expose Deepfakes with
          </span>{' '}
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Surgical Precision
          </span>
        </h1>

        <p className="text-white/40 text-lg max-w-2xl mx-auto mb-8">
          Powered by state-of-the-art AI, DeepScan analyzes any image or video in seconds — revealing manipulation that the human eye simply cannot detect.
        </p>

        {session ? (
          <div className="inline-flex items-center gap-2 mb-12 bg-white/[0.04] border border-white/[0.08] rounded-full px-5 py-2">
            <span className="text-white/50 text-sm">Welcome back,</span>
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent font-medium text-sm">
              {session.user?.username}
            </span>
            <span className="text-white/20 text-sm">·</span>
            <span className="text-blue-300 text-xs bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5">
              🪙 {session.user?.tokensRemaining} credits
            </span>
          </div>
        ) : (
          <div className="flex justify-center gap-4 mb-12">
            <Link href="/sign-up">
              <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white px-6 shadow-lg shadow-blue-900/30 transition-all">
                Start for Free
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" className="border-white/[0.08] text-white bg-white/[0.03] hover:bg-white/[0.06] px-6 transition-all">
                Sign In
              </Button>
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="flex justify-center gap-12 mb-20">
          {[
            { label: 'Detection Accuracy', value: '94%' },
            { label: 'Avg. Analysis Time', value: '~3s' },
            { label: 'Supported Formats', value: '10+' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-white/30 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Check Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* Image Card */}
          <div className="group bg-white/[0.03] border border-white/[0.08] hover:border-blue-500/30 rounded-2xl p-8 text-left transition-all shadow-xl shadow-blue-950/10 hover:shadow-blue-900/20">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-400/10 border border-blue-500/20 w-fit mb-5">
              <ImageIcon className="w-7 h-7 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Image Analysis</h2>
            <p className="text-white/35 text-sm mb-6">
              Upload any photo and our AI will instantly determine whether it's authentic or artificially generated. Supports JPG, PNG, and WEBP.
            </p>
            <Link href={session ? '/image-check' : '/sign-in'}>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-900/30 transition-all">
                Analyze an Image <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Video Card */}
          <div className="group bg-white/[0.03] border border-white/[0.08] hover:border-violet-500/30 rounded-2xl p-8 text-left transition-all shadow-xl shadow-violet-950/10 hover:shadow-violet-900/20">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-600/20 to-violet-400/10 border border-violet-500/20 w-fit mb-5">
              <Video className="w-7 h-7 text-violet-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Video Analysis</h2>
            <p className="text-white/35 text-sm mb-6">
              Submit a video clip and DeepScan will scan every frame for signs of synthetic manipulation. Supports MP4, MOV, and AVI.
            </p>
            <Link href={session ? '/video-check' : '/sign-in'}>
              <Button className="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white shadow-lg shadow-violet-900/30 transition-all">
                Analyze a Video <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-24 text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-2">
            How DeepScan Works
          </h2>
          <p className="text-white/30 text-sm mb-12">Three steps to uncover the truth</p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="w-6 h-6 text-blue-400" />,
                title: 'Upload Media',
                desc: 'Drop in any image or video file from your device',
                gradient: 'from-blue-600/20 to-blue-400/10',
                border: 'border-blue-500/20',
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-violet-400" />,
                title: 'AI Scans It',
                desc: 'Our model analyzes pixel-level patterns and frame inconsistencies',
                gradient: 'from-violet-600/20 to-violet-400/10',
                border: 'border-violet-500/20',
              },
              {
                icon: <ArrowRight className="w-6 h-6 text-blue-400" />,
                title: 'Instant Verdict',
                desc: 'Receive a clear Real or Fake result within seconds',
                gradient: 'from-blue-600/20 to-violet-400/10',
                border: 'border-blue-500/20',
              },
            ].map((step, i) => (
              <div
                key={i}
                className="bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.10] rounded-2xl p-6 transition-all"
              >
                <div className={`p-3 rounded-xl bg-gradient-to-br ${step.gradient} border ${step.border} w-fit mx-auto mb-4`}>
                  {step.icon}
                </div>
                <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                <p className="text-white/35 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}