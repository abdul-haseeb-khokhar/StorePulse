/**
 * The four "+" registration marks every blueprint-framed element wears
 * (cards, primary/secondary buttons, dialogs). Pure markup, styled by
 * the .blueprint/.corner rules in index.css.
 */
export default function Corners() {
  return (
    <>
      <i className="corner tl"></i>
      <i className="corner tr"></i>
      <i className="corner bl"></i>
      <i className="corner br"></i>
    </>
  );
}
