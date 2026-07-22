/**
 * BlankLayout — no Nav, just the content centered on the page. Used for
 * one-shot link landings (email verification, email-change confirmation)
 * where the card itself carries the only action the user needs.
 */
export default function BlankLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full" style={{ maxWidth: 400 }}>
        {children}
      </div>
    </div>
  );
}
