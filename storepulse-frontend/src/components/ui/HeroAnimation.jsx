import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Smile, HelpCircle, Package, TrendingUp, PartyPopper, User, Shirt, Cake, Footprints, Watch } from "lucide-react";

/**
 * HeroAnimation — founding story using lucide icons placed at the exact
 * 0px-offset coordinates of original circles/rectangles.
 */

const VB_W = 760;
const COUNTER_X = 380;
const COUNTER_Y = 65; // offset from aisleY

const DESKTOP_METRICS = { vbH: 300, aisleY: 165, shelfW: 130, shelfH: 50, rows: [39, 103], ownerHeadR: 11, ownerBodyH: 23, ownerBodyW: 32, itemSize: 14 };
const MOBILE_METRICS = { vbH: 340, aisleY: 195, shelfW: 165, shelfH: 62, rows: [42, 130], ownerHeadR: 15, ownerBodyH: 30, ownerBodyW: 42, itemSize: 17 };

function buildLayout(cols, rows, hotId, randomRestockIds, baseItemsPattern) {
  const shelves = cols.flatMap((cx, col) =>
    rows.map((cy, row) => {
      const id = row * cols.length + col;
      return { id, cx, cy, baseItems: baseItemsPattern[id] };
    })
  );
  const shelfById = Object.fromEntries(shelves.map((s) => [s.id, s]));
  const otherIds = shelves.map((s) => s.id).filter((id) => id !== hotId);
  return { shelves, hotId, randomRestockIds, shelfById, otherIds };
}

const DESKTOP_LAYOUT = buildLayout([140, 380, 620], DESKTOP_METRICS.rows, 4, [0, 2, 5], [2, 3, 2, 3, 2, 3]);
const MOBILE_LAYOUT = buildLayout([230, 530], MOBILE_METRICS.rows, 3, [0, 2], [2, 3, 2, 3]);

function pickWeightedShelf(layout) {
  return Math.random() < 0.45 ? layout.hotId : layout.otherIds[Math.floor(Math.random() * layout.otherIds.length)];
}

function buildEarlyWave(layout, delayStep) {
  const shelves = Array.from({ length: 5 }, () => pickWeightedShelf(layout));
  shelves.push(layout.hotId);
  return shelves.map((shelf, i) => ({ shelf, buys: i === 5, delay: i * delayStep }));
}

function buildLateWave(layout) {
  const [otherA, otherB] = layout.otherIds;
  return [
    { shelf: layout.hotId, buys: true },
    { shelf: layout.hotId, buys: true },
    { shelf: otherA, buys: false },
    { shelf: layout.hotId, buys: true },
    { shelf: otherB ?? otherA, buys: false },
    { shelf: layout.hotId, buys: true },
  ].map((b, i) => ({ ...b, delay: i * 0.45 }));
}

function buildWaves(layout) {
  return { WAVE1: buildEarlyWave(layout, 0.45), WAVE2: buildEarlyWave(layout, 0.4), WAVE3: buildLateWave(layout) };
}

const DESKTOP_WAVES = buildWaves(DESKTOP_LAYOUT);
const MOBILE_WAVES = buildWaves(MOBILE_LAYOUT);

const PHASES = [
  {
    name: "enter1", duration: 3800, waveKey: "WAVE1", stage: "enter",
    thought: { icon: Smile, color: "var(--moss)", text: "Customers walking in — let's see what they're after." },
  },
  {
    name: "browse1", duration: 3800, waveKey: "WAVE1", stage: "browse",
  },
  {
    name: "leave1", duration: 4200, waveKey: "WAVE1", stage: "leave",
    thought: { icon: HelpCircle, color: "var(--brick)", text: "Only one of them bought anything." },
  },
  {
    name: "think", duration: 4800,
    thought: { icon: HelpCircle, color: "var(--brick)", text: "Why did the rest just walk out? What do they actually want?" },
  },
  {
    name: "restock-random", duration: 4500,
    thought: { icon: Package, color: "var(--stamp)", text: "Let me add more stock and see if that helps." },
  },
  {
    name: "enter2", duration: 3500, waveKey: "WAVE2", stage: "enter",
    thought: { icon: Smile, color: "var(--moss)", text: "Let's see if the extra stock works." },
  },
  {
    name: "browse2", duration: 3800, waveKey: "WAVE2", stage: "browse",
  },
  {
    name: "leave2", duration: 4200, waveKey: "WAVE2", stage: "leave",
    thought: { icon: HelpCircle, color: "var(--brick)", text: "Still just one sale. I'm stocking the wrong things." },
  },
  {
    name: "insight", duration: 5000,
    thought: { icon: TrendingUp, color: "var(--gold)", text: "StorePulse: this shelf gets far more attention than the rest." },
  },
  {
    name: "restock-targeted", duration: 4500,
    thought: { icon: Package, color: "var(--gold)", text: "Then let's give that shelf real variety." },
  },
  {
    name: "enter3", duration: 3500, waveKey: "WAVE3", stage: "enter",
    thought: { icon: Smile, color: "var(--moss)", text: "Customers — let's see if this lands better." },
  },
  {
    name: "browse3", duration: 3800, waveKey: "WAVE3", stage: "browse",
  },
  {
    name: "leave3", duration: 4800, waveKey: "WAVE3", stage: "leave",
    thought: { icon: PartyPopper, color: "var(--moss)", text: "Sales are up — now I know what they're looking for." },
  },
];
const ORDER = PHASES.map((p) => p.name);
const idxOf = (name) => ORDER.indexOf(name);
const PHASE_BY_NAME = Object.fromEntries(PHASES.map((p) => [p.name, p]));

function useMediaQuery(query) {
  const subscribe = useCallback(
    (callback) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", callback);
      return () => mq.removeEventListener("change", callback);
    },
    [query]
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, getSnapshot);
}

function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

function useIsMobile() {
  return useMediaQuery("(max-width: 640px)");
}

function useIsVisible(ref) {
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
  return isVisible;
}

const STOCK_ICONS = [Shirt, Cake, Footprints, Watch, Package];

function Shelf({ cx, cy, itemCount, hot, baseItems, shelfW, shelfH, itemSize }) {
  const x = cx - shelfW / 2;
  const y = cy - shelfH / 2;
  const base = baseItems;
  const items = Array.from({ length: itemCount });
  const gap = itemSize + 10;
  return (
    <g>
      <rect x={x} y={y} width={shelfW} height={shelfH} fill="var(--paper-card)" stroke="var(--divider)" className={hot ? "hero-anim-shelf-hot" : ""} />
      {items.map((_, i) => {
        const isRestock = i >= base;
        const ix = x + 10 + (i % 5) * gap;
        const iy = y + 10 + Math.floor(i / 5) * (itemSize + 8);
        const Icon = STOCK_ICONS[i % STOCK_ICONS.length];
        return (
          <Icon
            key={i}
            x={ix}
            y={iy}
            size={itemSize}
            color={isRestock ? "var(--gold)" : "var(--stamp)"}
            opacity={isRestock ? 1 : 0.65}
            className={isRestock ? "hero-anim-item hero-anim-item-pop" : "hero-anim-item"}
            style={isRestock ? { "--hb-delay": `${(i - base) * 0.12}s` } : undefined}
          />
        );
      })}
    </g>
  );
}

function Buyer({ shelfById, shelf, buys, delay, stage, duration, aisleY }) {
  const s = shelfById[shelf];
  const shelfY = s.cy - aisleY;
  const cls =
    stage === "enter" ? "hero-anim-buyer-enter" : stage === "browse" ? "hero-anim-buyer-browse" : buys ? "hero-anim-buyer-leave-buy" : "hero-anim-buyer-leave-out";
  return (
    <g
      className={cls}
      style={{ "--hb-shelf-x": `${s.cx}px`, "--hb-shelf-y": `${shelfY}px`, "--hb-delay": `${delay}s`, "--hb-duration": `${duration}s` }}
    >
      <User
        x={-6}
        y={aisleY - 6}
        size={12}
        color="var(--muted)"
      />
    </g>
  );
}

export default function HeroAnimation() {
  const containerRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const isVisible = useIsVisible(containerRef);
  const layout = isMobile ? MOBILE_LAYOUT : DESKTOP_LAYOUT;
  const waves = isMobile ? MOBILE_WAVES : DESKTOP_WAVES;
  const metrics = isMobile ? MOBILE_METRICS : DESKTOP_METRICS;
  const vbH = metrics.vbH;
  const aisleY = metrics.aisleY;
  const counterTop = aisleY + COUNTER_Y;
  const ownerBodyY = counterTop - metrics.ownerBodyH;
  const ownerHeadCy = ownerBodyY - metrics.ownerHeadR;
  const [phaseIdx, setPhaseIdx] = useState(0);
  const phase = reducedMotion ? "leave3" : PHASES[phaseIdx].name;
  const current = PHASES[phaseIdx];

  useEffect(() => {
    if (reducedMotion || !isVisible) return undefined;
    const timer = setTimeout(() => {
      setPhaseIdx((i) => (i + 1) % PHASES.length);
    }, current.duration);
    return () => clearTimeout(timer);
  }, [phaseIdx, reducedMotion, isVisible, current.duration]);

  const idx = idxOf(phase);
  const randomRestocked = idx >= idxOf("restock-random");
  const targetedRestocked = idx >= idxOf("restock-targeted");
  const insightFound = idx >= idxOf("insight");

  let sold = 0;
  if (idx >= idxOf("leave1")) sold = 1;
  if (idx >= idxOf("leave2")) sold = 2;
  if (idx >= idxOf("leave3")) sold = 6;

  const showScan = !reducedMotion && phase === "insight";
  const thought = PHASE_BY_NAME[phase].thought;
  const buyers = !reducedMotion && current.waveKey ? waves[current.waveKey] : null;
  const hotShelf = layout.shelfById[layout.hotId];

  return (
    <div className="hero-anim" ref={containerRef}>
      <div className="hero-anim-tally-row">
        <div className="tag tag-neutral">
          Sold today: <strong style={{ marginLeft: 4, color: sold > 2 ? "var(--moss)" : "var(--ink)" }}>{sold}</strong>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${VB_W} ${vbH}`}
        role="img"
        aria-label="Animation: shoppers pass several shelves the owner can't track. Once StorePulse shows which shelf gets the most attention, he restocks that one shelf and far more shoppers buy."
      >
        {layout.shelves.map((s) => {
          const restocked = (layout.randomRestockIds.includes(s.id) && randomRestocked) || (s.id === layout.hotId && targetedRestocked);
          const itemCount = s.baseItems + (restocked ? (s.id === layout.hotId ? 4 : 2) : 0);
          return (
            <Shelf
              key={s.id}
              {...s}
              itemCount={itemCount}
              hot={s.id === layout.hotId && insightFound}
              shelfW={metrics.shelfW}
              shelfH={metrics.shelfH}
              itemSize={metrics.itemSize}
            />
          );
        })}

        {showScan && (
          <rect
            x={-40}
            y={metrics.rows[0] - metrics.shelfH / 2 - 10}
            width={30}
            height={metrics.rows[1] + metrics.shelfH / 2 - (metrics.rows[0] - metrics.shelfH / 2) + 20}
            fill="var(--gold)"
            opacity={0.14}
            className="hero-anim-scan"
          />
        )}
        {phase === "insight" && (
          <text x={hotShelf.cx} y={hotShelf.cy - metrics.shelfH / 2 - 8} textAnchor="middle" className="hero-anim-callout">
            most viewed shelf
          </text>
        )}

        <rect x={COUNTER_X - 90} y={counterTop} width={180} height={32} fill="var(--paper-card)" stroke="var(--divider)" />
        <text x={COUNTER_X} y={counterTop + 20} textAnchor="middle" className="hero-anim-desk-label">
          Store Owner
        </text>
        <rect x={COUNTER_X - metrics.ownerBodyW / 2} y={ownerBodyY} width={metrics.ownerBodyW} height={metrics.ownerBodyH} fill="var(--ink)" opacity={0.85} />
        <circle cx={COUNTER_X} cy={ownerHeadCy} r={metrics.ownerHeadR} fill="var(--ink)" opacity={0.85} />

        {buyers &&
          buyers.map((b, i) => (
            <Buyer key={`${phase}-${i}`} {...b} shelfById={layout.shelfById} aisleY={aisleY} stage={current.stage} duration={current.duration / 1000 - 0.2} />
          ))}
      </svg>

      {thought && (
        <div
          key={phase}
          className="hero-anim-bubble hero-anim-icon-pop"
          style={{ left: ((COUNTER_X + (isMobile ? 55 : 120)) / VB_W) * 100 + "%", top: ((ownerHeadCy - (isMobile ? 2 : 18)) / vbH) * 100 + "%" }}
        >
          <div className="hero-anim-bubble-kicker">Owner's thinking</div>
          <p className="hero-anim-bubble-text">{thought.text}</p>
          <span className="hero-anim-bubble-dot hero-anim-bubble-dot-1" />
          <span className="hero-anim-bubble-dot hero-anim-bubble-dot-2" />
        </div>
      )}

      {thought && (
        <div
          key={`${phase}-icon`}
          className="hero-anim-reaction hero-anim-icon-pop"
          style={{ left: ((COUNTER_X - (isMobile ? 95 : 60)) / VB_W) * 100 + "%", top: ((ownerHeadCy - (isMobile ? 4 : 0)) / vbH) * 100 + "%" }}
        >
          <thought.icon size={isMobile ? 10 : 16} color={thought.color} />
        </div>
      )}
    </div>
  );
}
