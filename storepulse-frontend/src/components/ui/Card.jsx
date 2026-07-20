import Corners from "./Corners";

const elevClass = { sm: "elev-sm", md: "elev-md", lg: "elev-lg" };

/**
 * Card — the transparent, hairline-bordered blueprint frame used for
 * every content block (forms, stats, site tiles, snippets). Content is
 * composed by callers using the .card-kicker/.card-title/.card-body/
 * .card-meta classes directly, since layout varies a lot per screen.
 */
export default function Card({ children, elevation, className = "", as: As = "div", ...props }) {
  return (
    <As className={`card blueprint ${elevation ? elevClass[elevation] : ""} ${className}`} {...props}>
      <Corners />
      {children}
    </As>
  );
}
