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
    <div className="flex justify-center items-center min-h-screen bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black pointer-events-none" />

      <div className="relative w-full max-w-md p-8 space-y-6 bg-white/5 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-sm">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-blue-600/20 border border-blue-500/30">
              <ShieldCheck className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Join <span className="text-blue-500">DeepScan</span>
          </h1>
          <p className="text-white/50 text-sm">Your first line of defense against synthetic media</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField name="fullname" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/70">Full Name</FormLabel>
                <Input {...field} placeholder="John Doe" className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500" />
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="username" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/70">Username</FormLabel>
                <Input {...field} placeholder="johndoe" onChange={(e) => { field.onChange(e); debounced(e.target.value); }} className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500" />
                {isCheckingUsername && <Loader2 className="h-4 w-4 mt-1 animate-spin text-white/40" />}
                {!isCheckingUsername && usernameMessage && (
                  <p className={`text-sm mt-1 ${isUsernameAvailable ? 'text-green-400' : 'text-red-400'}`}>{usernameMessage}</p>
                )}
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="email" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/70">Email Address</FormLabel>
                <Input {...field} placeholder="you@example.com" className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500" />
                <p className="text-white/30 text-xs">A verification code will be sent to this address</p>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="password" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/70">Password</FormLabel>
                <Input type="password" {...field} placeholder="••••••••" className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500" />
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold" disabled={isSubmitting || isCheckingUsername}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up your account...</> : 'Create My Account'}
            </Button>
          </form>
        </Form>

        <p className="text-center text-white/40 text-sm">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-blue-400 hover:text-blue-300 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}