import React from "react";
import type { NodeProps } from "reactflow";

export const StepHeaderNode: React.FC<NodeProps<{ label: string }>> = ({
  data,
}) => {
  return (
    <div className="flex items-center justify-center w-[200px] py-2 border-b-2 border-slate-200">
      <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
        {data.label}
      </span>
    </div>
  );
};
