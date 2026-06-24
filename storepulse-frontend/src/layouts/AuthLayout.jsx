/**
 * AuthLayout — wraps Login and Signup. Centers a single white card
 * on the soft gray background, matching the Stitch login/signup exports.
 * No sidebar, no topbar — these screens stand alone.
 */
export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-outline-variant/40 bg-surface-lowest p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
