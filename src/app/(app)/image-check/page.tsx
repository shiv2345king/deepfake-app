'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '../../../components/ui/button';
import { ShieldCheck, ShieldX, Upload, Loader2 } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import Image from 'next/image';

export default function ImageCheckPage() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<'Fake' | 'Real' | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setResult(null);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async () => {
    if (!file) return toast.error('Please select an image to analyze.');
    if (!session) return toast.error('You must be signed in to use DeepScan.');
    setIsAnalyzing(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await axios.post('/api/image-check', formData);
      setResult(response.data.result);
      setFileUrl(response.data.fileUrl);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data.message ?? 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => { setFile(null); setPreview(null); setResult(null); setFileUrl(null); };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a1040_0%,_#0a0a1a_60%)] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Image{' '}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Authenticity
            </span>{' '}
            Analysis
          </h1>
          <p className="text-white/40 text-sm mt-2">
            Our AI inspects pixel-level patterns to determine if an image has been synthetically generated or manipulated
          </p>
          {session && (
            <div className="inline-flex items-center gap-1.5 mt-3 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1">
              <span className="text-blue-300 text-xs">🪙 {session.user?.tokensRemaining} credits remaining</span>
            </div>
          )}
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 shadow-xl shadow-blue-950/20 backdrop-blur-sm">
          {result ? (
            <div className="flex flex-col items-center gap-6">
              {fileUrl && (
                <div className="relative w-full h-64 rounded-xl overflow-hidden border border-white/[0.08]">
                  <Image src={fileUrl} alt="Analyzed image" fill className="object-cover" />
                </div>
              )}

              <div className={`flex flex-col items-center gap-3 p-6 rounded-2xl border w-full ${
                result === 'Fake'
                  ? 'bg-red-500/[0.08] border-red-500/20'
                  : 'bg-emerald-500/[0.08] border-emerald-500/20'
              }`}>
                {result === 'Fake'
                  ? <ShieldX className="w-12 h-12 text-red-400" />
                  : <ShieldCheck className="w-12 h-12 text-emerald-400" />
                }
                <p className={`text-2xl font-bold ${result === 'Fake' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {result === 'Fake' ? '⚠ Synthetic Media Detected' : '✓ Authentic Image Confirmed'}
                </p>
                <p className="text-white/40 text-sm text-center">
                  {result === 'Fake'
                    ? 'This image shows strong indicators of AI generation or digital manipulation.'
                    : 'No signs of AI generation or manipulation were detected in this image.'}
                </p>
              </div>

              <Button
                onClick={handleReset}
                className="w-full bg-white/[0.05] hover:bg-white/[0.08] text-white border border-white/[0.08] transition-all"
              >
                Analyze Another Image
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <label
                htmlFor="image-upload"
                className={`w-full h-56 flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  preview
                    ? 'border-blue-500/40 bg-blue-500/[0.04]'
                    : 'border-white/[0.08] hover:border-violet-500/30 hover:bg-white/[0.03]'
                }`}
              >
                {preview ? (
                  <div className="relative w-full h-full rounded-xl overflow-hidden">
                    <Image src={preview} alt="Preview" fill className="object-cover rounded-xl" />
                  </div>
                ) : (
                  <>
                    <div className="p-3 rounded-full bg-gradient-to-br from-blue-600/10 to-violet-600/10 border border-white/[0.06] mb-3">
                      <Upload className="w-7 h-7 text-white/30" />
                    </div>
                    <p className="text-white/40 text-sm font-medium">Drop your image here or click to browse</p>
                    <p className="text-white/20 text-xs mt-1">JPG, PNG, WEBP — up to 10MB</p>
                  </>
                )}
                <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>

              {file && (
                <p className="text-white/30 text-xs bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5">
                  📎 {file.name}
                </p>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!file || isAnalyzing}
                className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-blue-900/30 disabled:opacity-50 transition-all"
              >
                {isAnalyzing
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running Analysis...</>
                  : 'Run Deepfake Analysis'
                }
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}