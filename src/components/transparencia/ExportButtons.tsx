"use client";
import { FileSpreadsheet, FileCode } from "lucide-react";
import { exportToCSV, exportToJSON } from "@/lib/exportUtils";

export default function ExportButtons({
    data,
    filename,
}: {
    data: any[];
    filename: string;
}) {
    return (
        <div className="flex gap-2">
            <button
                onClick={() => exportToCSV(data, filename)}
                className="inline-flex items-center gap-2 bg-[#fdb913] hover:brightness-105 text-slate-900 text-xs font-mono font-bold px-4 py-2.5 rounded-xl transition-all shadow-civic-sm"
            >
                <FileSpreadsheet size={15} />
                <span>CSV</span>
            </button>
            <button
                onClick={() => exportToJSON(data, filename)}
                className="inline-flex items-center gap-2 bg-[#01b0ef] hover:bg-[#0098d4] text-white text-xs font-mono font-bold px-4 py-2.5 rounded-xl transition-all shadow-civic-sm"
            >
                <FileCode size={15} />
                <span>JSON</span>
            </button>
        </div>
    );
}
