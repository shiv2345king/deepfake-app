'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { ShieldCheck, User, Mail, Coins, BadgeCheck, Pencil, X, Check } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (session?.user?.username) setNewUsername(session.user.username);
  }, [session]);

  const handleUpdate = async () => {
    if (!newUsername.trim()) return toast.error('Username cannot be empty.');
    if (newUsername === session?.user?.username) { setIsEditing(false); return; }
    setIsUpdating(true);
    try {
      await axios.put('/api/profile', { username: newUsername.trim().toLowerCase() });
      await update({ username: newUsername.trim().toLowerCase() });
      toast.success('Username updated successfully.');
      setIsEditing(false);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data.message ?? 'Failed to update username.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-blue-600/20 border border-blue-500/30">
              <User className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Your <span className="text-blue-500">Account</span>
          </h1>
          <p className="text-white/40 text-sm mt-2">Manage your DeepScan identity and preferences</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6 backdrop-blur-sm">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-blue-600/20 border-2 border-blue-500/30 flex items-center justify-center">
              <span className="text-3xl font-bold text-blue-400">
                {session?.user?.username?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-white/40 text-xs mb-1 flex items-center gap-1">
                <User className="w-3 h-3" /> Username
              </p>
              {isEditing ? (
                <div className="flex items-center gap-2 mt-1">
                  <Input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="bg-white/5 border-white/10 text-white h-8 text-sm focus:border-blue-500" autoFocus />
                  <Button size="sm" onClick={handleUpdate} disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700 text-white px-3"><Check className="w-4 h-4" /></Button>
                  <Button size="sm" onClick={() => { setIsEditing(false); setNewUsername(session?.user?.username ?? ''); }} className="bg-white/10 hover:bg-white/20 text-white px-3"><X className="w-4 h-4" /></Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-white font-medium">@{session?.user?.username}</p>
                  <button onClick={() => setIsEditing(true)} className="text-white/30 hover:text-blue-400 transition-colors"><Pencil className="w-4 h-4" /></button>
                </div>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-white/40 text-xs mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Email Address</p>
              <p className="text-white font-medium">{session?.user?.email}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-white/40 text-xs mb-1 flex items-center gap-1"><Coins className="w-3 h-3" /> Analysis Credits</p>
              <div className="flex items-center gap-3">
                <p className="text-white font-medium">{session?.user?.tokensRemaining} remaining</p>
                <div className="flex-1 bg-white/10 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${((session?.user?.tokensRemaining ?? 0) / 10) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-white/40 text-xs mb-1 flex items-center gap-1"><BadgeCheck className="w-3 h-3" /> Verification Status</p>
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-4 h-4 ${session?.user?.isVerified ? 'text-green-400' : 'text-red-400'}`} />
                <p className={`font-medium text-sm ${session?.user?.isVerified ? 'text-green-400' : 'text-red-400'}`}>
                  {session?.user?.isVerified ? 'Identity Verified' : 'Verification Pending'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}