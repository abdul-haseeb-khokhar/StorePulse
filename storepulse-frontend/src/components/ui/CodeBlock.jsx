import { useState } from "react";
import { Copy, Check } from "lucide-react";

/**
 * CodeBlock — Monospace code block component with StorePulse theme copy button.
 */
export default function CodeBlock({ code, children, language = "html", className = "" }) {
  const [copied, setCopied] = useState(false);
  const textToCopy = code || children || "";

  const handleCopy = () => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative group my-2 rounded-xl border border-[var(--divider-soft)] bg-[var(--paper-card)] overflow-hidden shadow-xs ${className}`}>
      
      {/* Top Bar with Language Tag & StorePulse Theme Copy Button */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-[var(--divider-soft)] bg-[var(--paper)] text-[11px] font-mono text-[var(--muted)]">
        <span className="uppercase font-semibold tracking-wider text-[#DDBB55]">{language}</span>
        
        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer border ${
            copied
              ? "bg-[#DDBB55]/15 text-[#DDBB55] border-[#DDBB55]/40"
              : "bg-[var(--paper-card)] border-[var(--divider-soft)] text-[var(--ink)] hover:border-[#DDBB55] hover:text-[#DDBB55]"
          }`}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-[#DDBB55]" />
              <span className="text-[#DDBB55] font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 text-[var(--muted)]" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Text Content */}
      <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed text-[var(--ink)] bg-[var(--paper-card)] whitespace-pre">
        <code>{textToCopy}</code>
      </pre>

    </div>
  );
}
