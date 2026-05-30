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
import { Link, ShieldCheck } from 'lucide-react';

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
      toast.error(axiosError.response?.data.message ?? 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black pointer-events-none" />

      <div className="relative w-full max-w-md p-8 space-y-6 bg-white/5 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-sm">

        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-blue-600/20 border border-blue-500/30">
              <ShieldCheck className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Verify your <span className="text-blue-500">Account</span>
          </h1>
          <p className="text-white/50 text-sm">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/70">Verification Code</FormLabel>
                  <Input
                    {...field}
                    placeholder="123456"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500 text-center text-xl tracking-widest"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Verify Account
            </Button>
          </form>
        </Form>

        <p className="text-center text-white/40 text-sm">
          Didn't receive a code?{' '}
          <Link href="/sign-up" className="text-blue-400 hover:text-blue-300 transition-colors">
            Sign up again
          </Link>
        </p>
      </div>
    </div>
  );
}