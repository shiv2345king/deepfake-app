'use client'

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '../components/ui/button';
import { User } from 'next-auth';
import { ShieldCheck } from 'lucide-react';

function Navbar() {
  const { data: session } = useSession();
  const user: User = session?.user as User;

  return (
    <nav className="px-6 py-4 border-b border-white/10 bg-black/60 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-blue-500" />
          <span className="text-xl font-bold text-white tracking-tight">
            Deep<span className="text-blue-500">Scan</span>
          </span>
        </Link>

        {/* Right side */}
        {session ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/60 hidden md:block">
              {user?.username || user?.email}
            </span>
            <span className="text-sm text-white/40 hidden md:block">
              🪙 {user?.tokensRemaining} tokens
            </span>
            <Link href="/profile">
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
                Profile
              </Button>
            </Link>
            <Button
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              variant="outline"
              className="border-white/20 text-white bg-transparent hover:bg-white/10"
            >
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
                Login
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        )}

      </div>
    </nav>
  );
}

export default Navbar;