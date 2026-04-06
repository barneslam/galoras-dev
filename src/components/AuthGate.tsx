/**
 * AuthGate — wraps any interactive element and locks it for guests.
 *
 * Usage:
 *   <AuthGate isLoggedIn={isLoggedIn} message="Sign in to message coaches">
 *     <button onClick={doSomething}>...</button>
 *   </AuthGate>
 *
 * When locked: renders a grayed-out, non-interactive version of the child
 * with a tooltip. Clicking the locked wrapper navigates to /signup.
 */
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

type Props = {
  isLoggedIn: boolean;
  message?: string;
  children: React.ReactNode;
  className?: string;
};

export function AuthGate({ isLoggedIn, message = "Sign in to access this feature", children, className }: Props) {
  const navigate = useNavigate();

  if (isLoggedIn) return <>{children}</>;

  return (
    <div
      className={`relative group/gate ${className ?? ""}`}
      title={message}
      onClick={() => navigate("/signup")}
      style={{ cursor: "pointer" }}
    >
      {/* Muted overlay on the child */}
      <div className="pointer-events-none opacity-40 select-none">
        {children}
      </div>

      {/* Lock badge */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Lock className="h-3.5 w-3.5 text-zinc-400 group-hover/gate:text-primary transition-colors" />
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 whitespace-nowrap opacity-0 group-hover/gate:opacity-100 transition-opacity pointer-events-none z-50">
        {message}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
      </div>
    </div>
  );
}
