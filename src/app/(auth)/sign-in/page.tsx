'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/form';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { signInSchema } from '../../../schemas/signInSchema';
import { ShieldCheck } from 'lucide-react';

export default function SignInForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const result = await signIn('credentials', {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });

    if (result?.error) {
      if (result.error === 'CredentialsSignin') {
        toast.error('Invalid email/username or password.');
      } else {
        toast.error(result.error);
      }
    }

    if (result?.url) {
      router.replace('/dashboard');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      {/* Background glow */}
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
            Welcome back to <span className="text-blue-500">DeepScan</span>
          </h1>
          <p className="text-white/50 text-sm">Sign in to start detecting deepfakes</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/70">Email / Username</FormLabel>
                  <Input
                    {...field}
                    placeholder="you@example.com"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/70">Password</FormLabel>
                  <Input
                    type="password"
                    {...field}
                    placeholder="••••••••"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all"
            >
              Sign In
            </Button>
          </form>
        </Form>

        <p className="text-center text-white/40 text-sm">
          Not a member yet?{' '}
          <Link href="/sign-up" className="text-blue-400 hover:text-blue-300 transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}