'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDebounceCallback } from 'usehooks-ts';
import { toast } from 'sonner';
import { Loader2, ShieldCheck } from 'lucide-react';
import { signUpSchema } from '../../../schemas/signUpSchema';
import { ApiResponse } from '../../../types/ApiResponse';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';

export default function SignUpForm() {
  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debounced = useDebounceCallback(setUsername, 300);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullname: '', username: '', email: '', password: '' },
  });

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (!username) { setUsernameMessage(''); setIsUsernameAvailable(null); return; }
      setIsCheckingUsername(true);
      try {
        const response = await axios.get(`/api/check-username?username=${encodeURIComponent(username)}`);
        setUsernameMessage(response.data.message);
        setIsUsernameAvailable(true);
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        setUsernameMessage(axiosError.response?.data.message ?? 'Error checking username');
        setIsUsernameAvailable(false);
      } finally {
        setIsCheckingUsername(false);
      }
    };
    checkUsernameUnique();
  }, [username]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>('/api/sign-up', data);
      toast.success(response.data.message);
      router.replace(`/verify/${data.username}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0a0a1a] py-10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a1040_0%,_#0a0a1a_60%)] pointer-events-none" />

      <div className="relative w-full max-w-md p-8 space-y-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl shadow-xl shadow-blue-950/20 backdrop-blur-sm">

        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Join{' '}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              DeepScan
            </span>
          </h1>
          <p className="text-white/40 text-sm">Your first line of defense against synthetic media</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            <FormField name="fullname" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/60 text-xs uppercase tracking-wider">Full Name</FormLabel>
                <Input
                  {...field}
                  placeholder="John Doe"
                  className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50 focus:bg-white/[0.06] transition-all"
                />
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="username" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/60 text-xs uppercase tracking-wider">Username</FormLabel>
                <Input
                  {...field}
                  placeholder="johndoe"
                  onChange={(e) => { field.onChange(e); debounced(e.target.value); }}
                  className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50 focus:bg-white/[0.06] transition-all"
                />
                {isCheckingUsername && <Loader2 className="h-4 w-4 mt-1 animate-spin text-violet-400" />}
                {!isCheckingUsername && usernameMessage && (
                  <p className={`text-sm mt-1 ${isUsernameAvailable ? 'text-emerald-400' : 'text-red-400'}`}>
                    {usernameMessage}
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="email" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/60 text-xs uppercase tracking-wider">Email Address</FormLabel>
                <Input
                  {...field}
                  placeholder="you@example.com"
                  className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50 focus:bg-white/[0.06] transition-all"
                />
                <p className="text-white/25 text-xs">A verification code will be sent to this address</p>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="password" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/60 text-xs uppercase tracking-wider">Password</FormLabel>
                <Input
                  type="password"
                  {...field}
                  placeholder="••••••••"
                  className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50 focus:bg-white/[0.06] transition-all"
                />
                <FormMessage />
              </FormItem>
            )} />

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-blue-900/30 transition-all"
              disabled={isSubmitting || isCheckingUsername}
            >
              {isSubmitting
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up your account...</>
                : 'Create My Account'}
            </Button>
          </form>
        </Form>

        <p className="text-center text-white/30 text-sm">
          Already have an account?{' '}
          <Link href="/sign-in" className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}