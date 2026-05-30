'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '../components/ui/button';
import { ShieldCheck, ImageIcon, Video, ArrowRight, Zap } from 'lucide-react';

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black pointer-events-none" />

      {/* Hero Section */}
      <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-blue-600/20 border border-blue-500/30">
            <ShieldCheck className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Detect Deepfakes with{' '}
          <span className="text-blue-500">AI Precision</span>
        </h1>

        <p className="text-white/50 text-lg max-w-2xl mx-auto mb-8">
          Upload any image or video and let DeepScan's AI instantly analyze
          whether it's real or AI-generated.
        </p>

        {session ? (
          <p className="text-white/30 text-sm mb-12">
            Welcome back, <span className="text-blue-400">{session.user?.username}</span> · 🪙 {session.user?.tokensRemaining} tokens remaining
          </p>
        ) : (
          <div className="flex justify-center gap-4 mb-12">
            <Link href="/sign-up">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                Get Started Free
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" className="border-white/20 text-white bg-transparent hover:bg-white/10 px-6">
                Sign In
              </Button>
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="flex justify-center gap-12 mb-20">
          {[
            { label: 'Accuracy', value: '94%' },
            { label: 'Avg. Analysis Time', value: '~3s' },
            { label: 'Formats Supported', value: '10+' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-blue-400">{stat.value}</p>
              <p className="text-white/40 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Check Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* Image Check */}
          <div className="group bg-white/5 border border-white/10 hover:border-blue-500/50 rounded-2xl p-8 text-left transition-all hover:bg-white/8">
            <div className="p-3 rounded-xl bg-blue-600/20 border border-blue-500/30 w-fit mb-5">
              <ImageIcon className="w-7 h-7 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Image Checker</h2>
            <p className="text-white/40 text-sm mb-6">
              Upload a photo and instantly find out if it's real or AI-generated. Supports JPG, PNG, and WEBP.
            </p>
            <Link href={session ? '/image-check' : '/sign-in'}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all">
                Check an Image <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Video Check */}
          <div className="group bg-white/5 border border-white/10 hover:border-purple-500/50 rounded-2xl p-8 text-left transition-all hover:bg-white/8">
            <div className="p-3 rounded-xl bg-purple-600/20 border border-purple-500/30 w-fit mb-5">
              <Video className="w-7 h-7 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Video Checker</h2>
            <p className="text-white/40 text-sm mb-6">
              Upload a video and let our AI analyze frames to detect deepfake manipulation. Supports MP4, MOV, and AVI.
            </p>
            <Link href={session ? '/video-check' : '/sign-in'}>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all">
                Check a Video <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

        </div>

        {/* How it works */}
        <div className="mt-24 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">How it works</h2>
          <p className="text-white/40 text-sm mb-12">Three simple steps to verify any media</p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Zap className="w-6 h-6 text-blue-400" />, title: 'Upload', desc: 'Choose an image or video from your device' },
              { icon: <ShieldCheck className="w-6 h-6 text-blue-400" />, title: 'Analyze', desc: 'Our AI model scans for deepfake patterns' },
              { icon: <ArrowRight className="w-6 h-6 text-blue-400" />, title: 'Get Result', desc: 'Instantly see if the media is Real or Fake' },
            ].map((step, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="p-3 rounded-xl bg-blue-600/20 border border-blue-500/30 w-fit mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                <p className="text-white/40 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}