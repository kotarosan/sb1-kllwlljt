"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X, Shield, ChevronDown } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.refresh();
  }, [router]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const adminStatus = await isAdmin(user.id);
        setIsAdminUser(adminStatus);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        isAdmin(session.user.id).then(setIsAdminUser);
      } else {
        setIsAdminUser(false);
      }
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? "bg-background/95 backdrop-blur-md shadow-sm" 
        : "bg-background/50 backdrop-blur-sm"
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-pink-600" />
            <span className="font-bold text-xl bg-gradient-to-r from-pink-600 to-purple-600 text-transparent bg-clip-text">
              Beauty Connection
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1">
                  サービス
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href="/services">メニュー一覧</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/pricing">料金プラン</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1">
                  コミュニティ
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href="/blog">ブログ</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/community">フォーラム</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/videos">動画</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" asChild>
              <Link href="/goals">目標</Link>
            </Button>

            <Button variant="ghost" asChild>
              <Link href="/rewards">特典交換</Link>
            </Button>

            <Button variant="ghost" asChild>
              <Link href="/about">私たちについて</Link>
            </Button>
          </nav>

          <div className="hidden md:flex items-center space-x-2">
            <ThemeToggle />
            {user ? (
              <>
                {isAdminUser && (
                  <Button variant="ghost" onClick={() => router.push('/admin')} className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    管理画面
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-1">
                      マイページ
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push('/mypage')}>
                      マイページ
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      ログアウト
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link href="/booking">
                  <Button className="bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700">
                    予約する
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => router.push('/auth')}>
                  ログイン
                </Button>
                <Link href="/booking">
                  <Button className="bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700">
                    予約する
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 -mr-2 hover:bg-accent rounded-md"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground px-2">サービス</p>
              <Link
                href="/services"
                className="block px-2 py-1.5 text-sm hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                メニュー一覧
              </Link>
              <Link
                href="/pricing"
                className="block px-2 py-1.5 text-sm hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                料金プラン
              </Link>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground px-2">コミュニティ</p>
              <Link
                href="/blog"
                className="block px-2 py-1.5 text-sm hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                ブログ
              </Link>
              <Link
                href="/community"
                className="block px-2 py-1.5 text-sm hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                フォーラム
              </Link>
              <Link
                href="/videos"
                className="block px-2 py-1.5 text-sm hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                動画
              </Link>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground px-2">その他</p>
              <Link
                href="/goals"
                className="block px-2 py-1.5 text-sm hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                目標
              </Link>
              <Link
                href="/rewards"
                className="block px-2 py-1.5 text-sm hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                特典交換
              </Link>
              <Link
                href="/about"
                className="block px-2 py-1.5 text-sm hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                私たちについて
              </Link>
            </div>

            {isAdminUser && (
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => {
                  router.push('/admin');
                  setIsOpen(false);
                }}
              >
                <Shield className="h-4 w-4" />
                管理画面
              </Button>
            )}

            <div className="pt-4 space-y-2">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      router.push('/mypage');
                      setIsOpen(false);
                    }}
                  >
                    マイページ
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                  >
                    ログアウト
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    router.push('/auth');
                    setIsOpen(false);
                  }}
                >
                  ログイン
                </Button>
              )}
              <Link 
                href="/booking" 
                className="w-full block"
                onClick={() => setIsOpen(false)}
              >
                <Button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700">
                  予約する
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}