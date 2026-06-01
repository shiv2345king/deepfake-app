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
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a1040_0%,_#0a0a1a_60%)] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20">
              <User className="w-10 h-10 text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Your{' '}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Account
            </span>
          </h1>
          <p className="text-white/40 text-sm mt-2">Manage your DeepScan identity and preferences</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 space-y-6 shadow-xl shadow-blue-950/20 backdrop-blur-sm">

          {/* Avatar */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600/20 to-violet-600/20 border-2 border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-900/20">
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                {session?.user?.username?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
          </div>

          <div className="space-y-3">

            {/* Username */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.10] transition-colors">
              <p className="text-white/40 text-xs mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                <User className="w-3 h-3" /> Username
              </p>
              {isEditing ? (
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="bg-white/[0.04] border-white/[0.08] text-white h-8 text-sm focus:border-blue-500/50"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white px-3"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => { setIsEditing(false); setNewUsername(session?.user?.username ?? ''); }}
                    className="bg-white/[0.05] hover:bg-white/[0.08] text-white px-3 border border-white/[0.08]"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-white font-medium">@{session?.user?.username}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-white/20 hover:text-blue-400 transition-colors p-1 rounded-lg hover:bg-blue-500/10"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.10] transition-colors">
              <p className="text-white/40 text-xs mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                <Mail className="w-3 h-3" /> Email Address
              </p>
              <p className="text-white font-medium">{session?.user?.email}</p>
            </div>

            {/* Credits */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.10] transition-colors">
              <p className="text-white/40 text-xs mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                <Coins className="w-3 h-3" /> Analysis Credits
              </p>
              <div className="flex items-center gap-3">
                <p className="text-white font-medium">
                  {session?.user?.tokensRemaining}
                  <span className="text-white/40 text-sm font-normal ml-1">remaining</span>
                </p>
                <div className="flex-1 bg-white/[0.06] rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-violet-500 h-1.5 rounded-full transition-all shadow-sm shadow-blue-500/50"
                    style={{ width: `${((session?.user?.tokensRemaining ?? 0) / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Verification */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.10] transition-colors">
              <p className="text-white/40 text-xs mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                <BadgeCheck className="w-3 h-3" /> Verification Status
              </p>
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded-full ${session?.user?.isVerified ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                  <ShieldCheck className={`w-4 h-4 ${session?.user?.isVerified ? 'text-emerald-400' : 'text-red-400'}`} />
                </div>
                <p className={`font-medium text-sm ${session?.user?.isVerified ? 'text-emerald-400' : 'text-red-400'}`}>
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