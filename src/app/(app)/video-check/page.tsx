'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '../../../components/ui/button';
import { ShieldCheck, ShieldX, Upload, Loader2, Video } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

export default function VideoCheckPage() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<'Fake' | 'Real' | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [framesAnalyzed, setFramesAnalyzed] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!file) return toast.error('Please select a video to analyze.');
    if (!session) return toast.error('You must be signed in to use DeepScan.');
    setIsAnalyzing(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('video', file);
      const response = await axios.post('/api/video-check', formData, { timeout: 120000 });
      setResult(response.data.result);
      setFileUrl(response.data.fileUrl);
      setFramesAnalyzed(response.data.framesAnalyzed);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data.message ?? 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => { setFile(null); setResult(null); setFileUrl(null); setFramesAnalyzed(null); };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-blue-600/20 border border-blue-500/30">
              <Video className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Video <span className="text-blue-500">Authenticity</span> Analysis
          </h1>
          <p className="text-white/50 text-sm mt-2">
            DeepScan extracts and inspects multiple frames to detect synthetic manipulation across the entire video
          </p>
          {session && (
            <p className="text-white/30 text-xs mt-1">🪙 {session.user?.tokensRemaining} credits remaining</p>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          {result ? (
            <div className="flex flex-col items-center gap-6">
              {fileUrl && (
                <div className="w-full rounded-xl overflow-hidden border border-white/10">
                  <video src={fileUrl} controls className="w-full max-h-64 object-cover" />
                </div>
              )}
              <div className={`flex flex-col items-center gap-3 p-6 rounded-2xl border w-full ${result === 'Fake' ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                {result === 'Fake' ? <ShieldX className="w-12 h-12 text-red-400" /> : <ShieldCheck className="w-12 h-12 text-green-400" />}
                <p className={`text-2xl font-bold ${result === 'Fake' ? 'text-red-400' : 'text-green-400'}`}>
                  {result === 'Fake' ? '⚠ Synthetic Video Detected' : '✓ Authentic Video Confirmed'}
                </p>
                <p className="text-white/40 text-sm text-center">
                  {result === 'Fake'
                    ? 'Multiple frames show strong indicators of deepfake manipulation or AI generation.'
                    : 'No signs of deepfake manipulation were detected across the analyzed frames.'}
                </p>
                {framesAnalyzed && (
                  <p className="text-white/20 text-xs">{framesAnalyzed} frames analyzed</p>
                )}
              </div>
              <Button onClick={handleReset} className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10">
                Analyze Another Video
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <label htmlFor="video-upload" className={`w-full h-56 flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all ${file ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}>
                {file ? (
                  <div className="flex flex-col items-center gap-3">
                    <Video className="w-10 h-10 text-blue-400" />
                    <p className="text-blue-400 text-sm font-medium">{file.name}</p>
                    <p className="text-white/30 text-xs">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-white/20 mb-3" />
                    <p className="text-white/40 text-sm font-medium">Drop your video here or click to browse</p>
                    <p className="text-white/20 text-xs mt-1">MP4, MOV, AVI — up to 100MB</p>
                  </>
                )}
                <input id="video-upload" type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
              </label>

              {isAnalyzing && (
                <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400 mx-auto mb-2" />
                  <p className="text-white/50 text-sm font-medium">Extracting frames and running analysis...</p>
                  <p className="text-white/20 text-xs mt-1">This may take up to 60 seconds depending on video length</p>
                </div>
              )}

              <Button onClick={handleSubmit} disabled={!file || isAnalyzing} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50">
                {isAnalyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running Analysis...</> : 'Run Deepfake Analysis'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}