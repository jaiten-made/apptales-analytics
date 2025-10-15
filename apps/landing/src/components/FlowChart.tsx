import { IconCheck, IconX } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";

type Step = {
  id: number;
  title: string;
  status: "success" | "fail" | "neutral";
  time?: string;
};

const steps: Step[] = [
  { id: 1, title: "Click Start Upload", status: "success", time: "4s" },
  { id: 2, title: "Click Select File", status: "success", time: "10s" },
  { id: 3, title: "Click Publish", status: "fail" },
];

// Card now accepts an animation state to toggle classes
const Card: React.FC<{ step: Step; animState: string }> = ({
  step,
  animState,
}) => {
  const borderColor =
    step.status === "success"
      ? "border-green-500"
      : step.status === "fail"
        ? "border-red-500"
        : "border-gray-300";
  const dotBg =
    step.status === "success"
      ? "bg-green-500"
      : step.status === "fail"
        ? "bg-red-500"
        : "bg-gray-400";

  // animation class mapping
  const growClass = animState === "growing" ? "animate-grow" : "";
  const shakeClass = animState === "shaking" ? "animate-shake" : "";

  return (
    <div
      className={`w-80 z-2 rounded-md border-2 ${borderColor} bg-white shadow-sm px-6 py-4 transform-gpu ${growClass} ${shakeClass}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${dotBg} transform-gpu ${growClass}`}
        >
          {step.status === "success" ? <IconCheck /> : <IconX />}
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900">{step.title}</div>
        </div>
      </div>
    </div>
  );
};

const FlowChart: React.FC = () => {
  // 'idle' | 'growing' | 'shaking' | 'done'
  const [animStates, setAnimStates] = useState<string[]>(() =>
    steps.map(() => "idle")
  );
  const [activeConnector, setActiveConnector] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // Run one cycle of animations top-to-bottom
    const runCycle = async () => {
      for (let i = 0; i < steps.length; i++) {
        if (!mounted) return;
        const step = steps[i];

        // highlight connector below the current step while animating (if any)
        setActiveConnector(i);

        if (step.status === "success") {
          setAnimStates((prev) => {
            const copy = [...prev];
            copy[i] = "growing";
            return copy;
          });
          // grow then back to normal
          await sleep(600);
          setAnimStates((prev) => {
            const copy = [...prev];
            copy[i] = "done";
            return copy;
          });
        } else if (step.status === "fail") {
          // set to shaking directly (no grow first)
          setAnimStates((prev) => {
            const copy = [...prev];
            copy[i] = "shaking";
            return copy;
          });
          // wait for shake animation to finish
          await sleep(700);
          setAnimStates((prev) => {
            const copy = [...prev];
            copy[i] = "done";
            return copy;
          });
        } else {
          // neutral or other: mark done
          setAnimStates((prev) => {
            const copy = [...prev];
            copy[i] = "done";
            return copy;
          });
        }

        // small gap before next step
        await sleep(220);
        setActiveConnector(null);
      }
    };

    // Loop cycles until unmounted
    const loop = async () => {
      while (mounted) {
        // reset states before each cycle
        setAnimStates(steps.map(() => "idle"));
        setActiveConnector(null);
        // short lead-in before starting the cycle
        await sleep(300);
        await runCycle();
        // pause between full cycles
        await sleep(800);
      }
    };

    loop();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="w-full flex items-center justify-center">
      <div className="relative py-6">
        <div className="flex flex-col items-center">
          {steps.map((s, idx) => {
            const isBlocked =
              s.status === "success" && steps[idx + 1]?.status === "fail";
            const connectorActive = activeConnector === idx;

            return (
              <div key={s.id} className="flex items-center flex-col">
                <Card step={s} animState={animStates[idx]} />
                {idx < steps.length - 1 && (
                  <div className="flex flex-col items-center">
                    <div className="relative flex items-center h-32">
                      <div
                        className={`w-px h-full bg-dashed-line mx-auto ${
                          isBlocked ? "no-anim" : ""
                        } ${connectorActive ? "connector-active" : ""}`}
                      />
                      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-50 text-sm text-gray-500 px-2 rounded-md">
                        {steps[idx + 1].time}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        .bg-dashed-line {
          width: 2px;
          background-image: linear-gradient(#d1d5db 33%, rgba(255,255,255,0) 0%);
          background-size: 2px 12px;
          background-repeat: repeat-y;
          animation: dash-scroll 1s linear infinite;
        }

        @keyframes dash-scroll {
          from { background-position: 0 0; }
          to   { background-position: 0 12px; }
        }
        /* disable animation and slightly dim when blocked between success -> fail */
        .bg-dashed-line.no-anim {
          animation: none;
          opacity: 0.55;
        }

        /* grow animation: scale up then back to normal */
        @keyframes grow-scale {
          0% { transform: scale(1); }
          40% { transform: scale(1.18); }
          100% { transform: scale(1); }
        }
        .animate-grow {
          animation: grow-scale 600ms cubic-bezier(.2,.9,.2,1) both;
          will-change: transform;
        }

        /* shake animation for failures */
        @keyframes shake-x {
          0% { transform: translateX(0); }
          15% { transform: translateX(-6px); }
          30% { transform: translateX(6px); }
          45% { transform: translateX(-4px); }
          60% { transform: translateX(4px); }
          100% { transform: translateX(0); }
        }
        .animate-shake {
          animation: shake-x 700ms cubic-bezier(.36,.07,.19,.97) both;
          will-change: transform;
        }
       `}</style>
    </div>
  );
};

export default FlowChart;
