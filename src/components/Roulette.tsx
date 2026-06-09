"use client";
import { useRef, useState, useCallback, useEffect } from "react";

// ============================================================
// 円形ルーレット（SVGスピンホイール）
// ============================================================

interface Props {
  onComplete: (value: number) => void;
}

const SEG_COLORS = [
  "#ff2844", // 1
  "#ff8c00", // 2
  "#ffcc00", // 3
  "#00e864", // 4
  "#4488ff", // 5
  "#cc44ff", // 6
];

const W = 230, CX = 115, CY = 115, R = 100, RI = 32;

function rad(deg: number) { return (deg - 90) * Math.PI / 180; }
function pt(r: number, deg: number) {
  return { x: CX + r * Math.cos(rad(deg)), y: CY + r * Math.sin(rad(deg)) };
}

function sectorPath(i: number): string {
  const a1 = i * 60, a2 = (i + 1) * 60;
  const o = pt(RI, a1), p = pt(R, a1), q = pt(R, a2), n = pt(RI, a2);
  return [
    `M${o.x},${o.y}`,
    `L${p.x},${p.y}`,
    `A${R},${R} 0 0,1 ${q.x},${q.y}`,
    `L${n.x},${n.y}`,
    `A${RI},${RI} 0 0,0 ${o.x},${o.y}Z`,
  ].join(" ");
}

function labelPos(i: number) {
  return pt((R + RI) / 2 + 6, i * 60 + 30);
}

export function Roulette({ onComplete }: Props) {
  const [totalRot, setTotalRot]   = useState(0);
  const [phase, setPhase]         = useState<"idle" | "spinning" | "done">("idle");
  const [result, setResult]       = useState<number | null>(null);
  const [isAnimating, setIsAnim]  = useState(false);
  const rotRef  = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // クリーンアップ
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const spin = useCallback(() => {
    if (phase !== "idle") return;

    const target = Math.floor(Math.random() * 6) + 1;

    // セグメント中心角 → ポインター（上）に揃えるための回転量を計算
    // セグメントiの中心は i*60 + 30 度（上が0°）
    const segCenter = (target - 1) * 60 + 30;
    const alignAngle = (360 - segCenter + 360) % 360;
    const curMod = ((rotRef.current % 360) + 360) % 360;
    let delta = alignAngle - curMod;
    if (delta < 45) delta += 360;

    const finalRot = rotRef.current + delta + 5 * 360; // 5回転以上
    rotRef.current = finalRot;

    setTotalRot(finalRot);
    setPhase("spinning");
    setIsAnim(true);
    setResult(null);

    timerRef.current = setTimeout(() => {
      setIsAnim(false);
      setPhase("done");
      setResult(target);
      onComplete(target);
    }, 3200);
  }, [phase, onComplete]);

  const color = result ? SEG_COLORS[result - 1] : "#6040a0";

  return (
    <div className="flex flex-col items-center w-full gap-2">

      {/* ── ルーレットホイール ── */}
      <div style={{ position: "relative", width: W, height: W + 20 }}>

        {/* ポインター（上） */}
        <div style={{
          position: "absolute", top: 0, left: "50%",
          transform: "translateX(-50%)",
          width: 0, height: 0,
          borderLeft: "12px solid transparent",
          borderRight: "12px solid transparent",
          borderTop: "24px solid var(--color-gold)",
          zIndex: 10,
          filter: "drop-shadow(0 2px 6px rgba(255,204,0,0.6))",
        }} />

        <svg width={W} height={W} style={{ marginTop: 20 }}>
          {/* 外枠リング */}
          <circle cx={CX} cy={CY} r={R + 10} fill="none" stroke="#3a2060" strokeWidth={8} />
          <circle cx={CX} cy={CY} r={R + 12} fill="none" stroke="var(--color-gold)" strokeWidth={3} />

          {/* デコレーション dots */}
          {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => {
            const p = pt(R + 6, a);
            return <circle key={a} cx={p.x} cy={p.y} r={3} fill="var(--color-gold)" opacity={0.7} />;
          })}

          {/* スピングループ */}
          <g style={{
            transformOrigin: `${CX}px ${CY}px`,
            transform: `rotate(${totalRot}deg)`,
            transition: isAnimating
              ? "transform 3s cubic-bezier(0.17, 0.67, 0.05, 1.0)"
              : "none",
          }}>
            {/* セクション */}
            {SEG_COLORS.map((col, i) => (
              <path key={i} d={sectorPath(i)} fill={col} stroke="#000" strokeWidth={1.5} />
            ))}

            {/* 区切り線（ゴールド） */}
            {[0,1,2,3,4,5].map(i => {
              const p1 = pt(RI, i * 60), p2 = pt(R, i * 60);
              return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />;
            })}

            {/* 数字ラベル */}
            {SEG_COLORS.map((_, i) => {
              const { x, y } = labelPos(i);
              return (
                <g key={i}>
                  <text
                    x={x} y={y}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={22} fontWeight="bold"
                    fontFamily="'DotGothic16', monospace"
                    fill="#000" stroke="#000" strokeWidth={3} strokeLinejoin="round"
                  >
                    {i + 1}
                  </text>
                  <text
                    x={x} y={y}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={22} fontWeight="bold"
                    fontFamily="'DotGothic16', monospace"
                    fill="#fff"
                  >
                    {i + 1}
                  </text>
                </g>
              );
            })}
          </g>

          {/* センターハブ */}
          <circle cx={CX} cy={CY} r={RI + 2} fill="#08041a" stroke="var(--color-gold)" strokeWidth={3} />
          <circle cx={CX} cy={CY} r={RI - 2} fill="#120840" />

          {/* 結果表示（センター） */}
          {result ? (
            <text
              x={CX} y={CY}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={30} fontWeight="bold"
              fontFamily="'DotGothic16', monospace"
              fill={color}
              style={{ filter: `drop-shadow(0 0 8px ${color})` }}
            >
              {result}
            </text>
          ) : (
            <text
              x={CX} y={CY}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={18} fill="#4a3080"
              fontFamily="'DotGothic16', monospace"
            >
              ?
            </text>
          )}
        </svg>
      </div>

      {/* ── ボタン / 状態 ── */}
      {phase === "idle" && (
        <button
          onClick={spin}
          className="btn-retro w-full py-5 font-bold text-2xl tracking-widest retro-text"
          style={{
            background: "linear-gradient(180deg, #2a0070, #1a0050)",
            color: "var(--color-gold)",
            border: "3px solid var(--color-gold)",
            boxShadow: "3px 3px 0 #7a5500, 0 0 18px rgba(255,204,0,0.3)",
            borderRadius: 4,
          }}
        >
          ▶ まわす！
        </button>
      )}

      {phase === "spinning" && (
        <div
          className="w-full py-5 text-center font-bold retro-text"
          style={{ color: "#5040a0", fontSize: 16 }}
        >
          <span className="anim-blink inline-block">● スピン中…</span>
        </div>
      )}

      {phase === "done" && result && (
        <div
          className="w-full py-4 text-center font-bold retro-text anim-pop-in"
          style={{
            color: color,
            fontSize: 26,
            textShadow: `0 0 12px ${color}, 2px 2px 0 #000`,
          }}
        >
          ★ {result} が出た！ ★
        </div>
      )}
    </div>
  );
}
