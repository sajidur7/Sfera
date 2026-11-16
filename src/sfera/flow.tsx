import * as stylex from '@stylexjs/stylex';
import { useRef, useState, type ReactNode } from 'react';
import { accent, colors, font, motion, radius } from './tokens.stylex';
import { fx } from './shared';

// #region FlowCanvas
export type FlowNode = { id: string; x: number; y: number; title: string; subtitle?: string; icon?: ReactNode; kind?: 'trigger' | 'action' | 'condition' | 'end'; tag?: string };
export type FlowEdge = { from: string; to: string; label?: string };
const NW = 220;
const NH = 64;
const fl = stylex.create({
  wrap: { position: 'relative', overflow: 'auto', minWidth: 0, borderRadius: radius.card, borderWidth: 1, borderStyle: 'solid', borderColor: colors.border, backgroundColor: colors.well },
  canvas: { position: 'relative' },
  node: {
    position: 'absolute',
    width: NW,
    height: NH,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 12px',
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    cursor: 'grab',
    textAlign: 'left',
    color: colors.text,
    touchAction: 'none',
    transitionProperty: 'border-color, box-shadow',
    transitionDuration: motion.fast,
  },
  sel: { borderColor: accent.base, boxShadow: `0 0 0 3px color-mix(in oklab, ${accent.base} 20%, transparent)` },
  icon: { width: 32, height: 32, borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: colors.well, color: colors.textMuted },
  trigger: { backgroundColor: accent.base, color: accent.onAccent },
  condition: { backgroundColor: `color-mix(in oklab, ${colors.warning} 22%, ${colors.surface})`, color: `color-mix(in oklab, ${colors.warning} 60%, ${colors.text})` },
  end: { backgroundColor: `color-mix(in oklab, ${colors.success} 18%, ${colors.surface})`, color: `color-mix(in oklab, ${colors.success} 70%, ${colors.text})` },
  text: { display: 'flex', flexDirection: 'column', minWidth: 0 },
  title: { fontSize: font.sm, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  sub: { fontSize: font.xs, color: colors.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  edgeLabel: { fontSize: 11, fontFamily: font.mono },
  tag: { position: 'absolute', height: 22, paddingInline: 8, display: 'inline-flex', alignItems: 'center', borderRadius: 7, fontSize: 12, fontWeight: 500, pointerEvents: 'none' },
  tagTrigger: { backgroundColor: `color-mix(in oklab, ${accent.base} 14%, transparent)`, color: `color-mix(in oklab, ${accent.base} 80%, ${colors.text})` },
  tagCondition: { backgroundColor: `color-mix(in oklab, ${colors.warning} 18%, transparent)`, color: `color-mix(in oklab, ${colors.warning} 62%, ${colors.text})` },
  tagOther: { backgroundColor: colors.surface, color: colors.textMuted },
});
/**
 * Workflow canvas: nodes connected by edges. Drag nodes to arrange them;
 * arrow keys nudge the selected node by 20px.
 */
export function FlowCanvas({ nodes, edges, onNodesChange, selected, onSelect, height = 460 }: { nodes: FlowNode[]; edges: FlowEdge[]; onNodesChange: (n: FlowNode[]) => void; selected?: string | null; onSelect?: (id: string) => void; height?: number }) {
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const [, force] = useState(0);
  const W = Math.max(...nodes.map((n) => n.x + NW)) + 60;
  const H = Math.max(height - 2, ...nodes.map((n) => n.y + NH + 60));
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const move = (id: string, x: number, y: number) => onNodesChange(nodes.map((n) => (n.id === id ? { ...n, x: Math.max(10, x), y: Math.max(10, y) } : n)));
  return (
    <div {...stylex.props(fl.wrap)} style={{ height }}>
      <div {...stylex.props(fl.canvas)} style={{ width: W, height: H }}>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }} aria-hidden>
          {edges.map((e, i) => {
            const a = byId[e.from];
            const b = byId[e.to];
            if (!a || !b) return null;
            const x1 = a.x + NW / 2;
            const y1 = a.y + NH;
            const x2 = b.x + NW / 2;
            const y2 = b.y;
            const my = (y1 + y2) / 2;
            return (
              <g key={i}>
                <path d={`M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`} fill="none" style={{ stroke: colors.borderStrong }} strokeWidth={1.5} />
                <circle cx={x2} cy={y2} r={3.5} style={{ fill: colors.borderStrong }} />
                {e.label && (
                  <text x={(x1 + x2) / 2 + 6} y={my - 4} {...stylex.props(fl.edgeLabel)} style={{ fill: colors.textMuted }}>
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {nodes.map((n) =>
          n.tag ? (
            <span key={n.id + '-tag'} {...stylex.props(fl.tag, n.kind === 'trigger' ? fl.tagTrigger : n.kind === 'condition' ? fl.tagCondition : fl.tagOther)} style={{ left: n.x + 8, top: n.y - 28 }}>
              {n.tag}
            </span>
          ) : null,
        )}
        {nodes.map((n) => (
          <button
            key={n.id}
            type="button"
            aria-pressed={selected === n.id}
            aria-label={`${n.title}${n.subtitle ? ', ' + n.subtitle : ''}. Arrow keys move it.`}
            onPointerDown={(e) => {
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              drag.current = { id: n.id, dx: e.clientX - n.x, dy: e.clientY - n.y };
              onSelect?.(n.id);
            }}
            onPointerMove={(e) => drag.current?.id === n.id && move(n.id, e.clientX - drag.current.dx, e.clientY - drag.current.dy)}
            onPointerUp={() => ((drag.current = null), force((x) => x + 1))}
            onKeyDown={(e) => {
              const d: Record<string, [number, number]> = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] };
              if (d[e.key]) (e.preventDefault(), move(n.id, n.x + d[e.key][0], n.y + d[e.key][1]));
            }}
            onFocus={() => onSelect?.(n.id)}
            {...stylex.props(fl.node, selected === n.id && fl.sel, fx.focus)}
            style={{ left: n.x, top: n.y }}
          >
            <span {...stylex.props(fl.icon, n.kind === 'trigger' && fl.trigger, n.kind === 'condition' && fl.condition, n.kind === 'end' && fl.end)}>{n.icon}</span>
            <span {...stylex.props(fl.text)}>
              <span {...stylex.props(fl.title)}>{n.title}</span>
              {n.subtitle && <span {...stylex.props(fl.sub)}>{n.subtitle}</span>}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
// #endregion
