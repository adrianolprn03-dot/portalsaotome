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
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold px-4 py-2.5 rounded-xl transition-all shadow-civic-sm"
            >
                <FileSpreadsheet size={15} />
                <span>CSV</span>
            </button>
            <button
                onClick={() => exportToJSON(data, filename)}
                className="inline-flex items-center gap-2 bg-[#071E3D] hover:bg-primary-700 text-white text-xs font-mono font-bold px-4 py-2.5 rounded-xl transition-all shadow-civic-sm"
            >
                <FileCode size={15} />
                <span>JSON</span>
            </button>
        </div>
    );
}
