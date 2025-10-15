import React from "react";

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

const Card: React.FC<{ step: Step }> = ({ step }) => {
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

  return (
    <div
      className={`w-80 rounded-md border-2 ${borderColor} bg-white shadow-sm px-6 py-4`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${dotBg}`}
        >
          {step.status === "success" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 00-1.414-1.414L7 12.172 4.707 9.879a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l9-9z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm-2.293-9.707a1 1 0 011.414 0L10 8.586l.879-.879a1 1 0 111.414 1.414L11.414 10l.879.879a1 1 0 11-1.414 1.414L10 11.414l-.879.879a1 1 0 11-1.414-1.414L8.586 10l-.879-.879a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900">{step.title}</div>
        </div>
      </div>
    </div>
  );
};

const FlowChart: React.FC = () => {
  return (
    <div className="w-full flex items-center justify-center">
      <div className="relative py-6">
        <div className="flex flex-col items-center">
          {steps.map((s, idx) => {
            const isBlocked =
              s.status === "success" && steps[idx + 1]?.status === "fail";
            return (
              <div key={s.id} className="flex items-center flex-col">
                <Card step={s} />
                {idx < steps.length - 1 && (
                  <div className="flex flex-col items-center">
                    <div className="relative flex items-center h-32">
                      <div
                        className={`w-px h-full bg-dashed-line mx-auto ${
                          isBlocked ? "no-anim" : ""
                        }`}
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
          /* animate the background-position to create a flowing dashed effect */
          animation: dash-scroll 1s linear infinite;
        }
 
         @keyframes dash-scroll {
           from { background-position: 0 0; }
           to   { background-position: 0 12px; }
         }
        /* disable animation and slightly dim when blocked between success -> fail */
        .bg-dashed-line.no-anim {
          animation: none;
         
        }
       `}</style>
    </div>
  );
};

export default FlowChart;
