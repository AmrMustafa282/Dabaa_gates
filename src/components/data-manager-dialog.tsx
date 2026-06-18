"use client";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download, Upload, Database } from "lucide-react";

export function DataManagerDialog({
  open,
  onOpenChange,
  onImportSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<"replace" | "merge">("replace");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const exportData = async (includeLogs: boolean) => {
    setError("");
    const url = `/api/export?includeLogs=${includeLogs}`;
    const res = await fetch(url);
    if (!res.ok) {
      setError("Export failed");
      return;
    }
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `gates-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMessage(`Exported gates${includeLogs ? " with logs" : ""} successfully`);
  };

  const handleImport = async (file: File) => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.gates || !Array.isArray(data.gates)) {
        setError("Invalid file: missing gates array");
        return;
      }

      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gates: data.gates, mode: importMode }),
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? "Import failed");
        return;
      }

      setMessage(`Imported ${result.total} gate(s) (${importMode} mode)`);
      onImportSuccess();
    } catch {
      setError("Failed to parse import file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </DialogTitle>
          <DialogDescription>
            Export your gate configuration or import from a backup file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Export</Label>
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => exportData(false)}>
                <Download className="h-4 w-4" />
                Export Gates (JSON)
              </Button>
              <Button variant="outline" onClick={() => exportData(true)}>
                <Download className="h-4 w-4" />
                Export Gates + Logs (JSON)
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Import</Label>
            <div className="flex gap-2">
              {(["replace", "merge"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setImportMode(mode)}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm capitalize transition-colors ${
                    importMode === mode
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Replace removes all existing gates. Merge updates matching orders and adds new ones.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImport(file);
                e.target.value = "";
              }}
            />
            <Button
              variant="outline"
              className="w-full"
              disabled={loading}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              {loading ? "Importing..." : "Choose JSON File"}
            </Button>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-emerald-400">{message}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
