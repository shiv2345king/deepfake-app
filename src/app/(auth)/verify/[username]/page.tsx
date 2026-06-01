'use client';

import { Button } from '../../../../components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '../../../../components/ui/form';
import { Input } from '../../../../components/ui/input';
import { toast } from 'sonner';
import { ApiResponse } from '../../../../types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { verifySchema } from '../../../../schemas/verifySchema';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function VerifyAccount() {
  const router = useRouter();
  const params = useParams<{ username: string }>();

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: '' },
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      const response = await axios.post<ApiResponse>('/api/verify-code', {
        username: decodeURIComponent(params.username).trim().toLowerCase(),
        code: data.code.trim(),
      });
      toast.success(response.data.message);
      router.replace('/sign-in');
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? 'Verification failed. Please try again.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0a0a1a]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a1040_0%,_#0a0a1a_60%)] pointer-events-none" />

      <div className="relative w-full max-w-md p-8 space-y-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl shadow-xl shadow-blue-950/20 backdrop-blur-sm">

        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Verify your{' '}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Identity
            </span>
          </h1>
          <p className="text-white/40 text-sm">
            Enter the 6-digit code we sent to your email address to activate your account
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField name="code" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/60 text-xs uppercase tracking-wider">Verification Code</FormLabel>
                <Input
                  {...field}
                  placeholder="123456"
                  className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-blue-500/50 focus:bg-white/[0.06] text-center text-2xl tracking-[0.5em] transition-all"
                />
                <FormMessage />
              </FormItem>
            )} />
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-blue-900/30 transition-all"
            >
              Verify & Activate Account
            </Button>
          </form>
        </Form>

        <p className="text-center text-white/30 text-sm">
          Didn't receive a code?{' '}
          <Link href="/sign-up" className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            Try signing up again
          </Link>
        </p>
      </div>
    </div>
  );
}