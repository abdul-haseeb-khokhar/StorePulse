import Corners from "./Corners";

/**
 * Dialog — modal over a backdrop, at the top elevation. Used for the
 * "regenerate API key?" confirmation.
 */
export default function Dialog({ open, title, children, actions, onClose }) {
  if (!open) return null;

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog blueprint"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <Corners />
        <div className="dialog-title" id="dialog-title">
          {title}
        </div>
        <div className="dialog-body">{children}</div>
        <div className="dialog-actions">{actions}</div>
      </div>
    </div>
  );
}
