import { Link } from "@tanstack/react-router";
import { Brand } from "@/components/layout/Brand";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function SiteHeader() {
  const { user, loading } = useAuth();

  return (
    <nav className="relative z-10 border-b border-black/5 bg-glass backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Brand />
        <div className="hidden items-center gap-7 text-sm font-medium text-ink/70 md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-civic">
            How it works
          </a>
          <a href="#issue-types" className="transition-colors hover:text-civic">
            Issue types
          </a>
          {user && (
            <Link to="/reports" className="transition-colors hover:text-civic">
              My reports
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!loading && !user && (
            <Link
              to="/login"
              className="hidden text-sm font-medium text-civic transition-colors hover:text-civic-deep sm:inline-flex"
            >
              Log in
            </Link>
          )}
          {user ? (
            <Button asChild variant="signal">
              <Link to="/dashboard">Open dashboard</Link>
            </Button>
          ) : (
            <Button asChild variant="signal">
              <Link to="/reports/new">Report an issue</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
