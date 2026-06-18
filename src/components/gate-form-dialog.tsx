"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Gate = {
  id: string;
  name: string;
  ip: string;
  order: number;
};

export function GateFormDialog({
  open,
  onOpenChange,
  gate,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gate: Gate | null;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [order, setOrder] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEdit = gate !== null;

  useEffect(() => {
    if (!open) return;
    if (gate) {
      setName(gate.name);
      setIp(gate.ip);
      setOrder(String(gate.order));
    } else {
      setName("");
      setIp("");
      setOrder("");
    }
    setError("");
  }, [open, gate]);

  const resetForm = () => {
    if (gate) {
      setName(gate.name);
      setIp(gate.ip);
      setOrder(String(gate.order));
    } else {
      setName("");
      setIp("");
      setOrder("");
    }
    setError("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body: Record<string, string | number> = {
      name,
      ip,
    };
    if (order) body.order = parseInt(order, 10);

    const url = isEdit ? `/api/gates/${gate.id}` : "/api/gates";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }

    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Gate" : "Add Gate"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the gate name, IP address, or chain order."
              : "Add a new gate to the monitoring chain. Gates are checked in order."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Gate A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ip">IP Address</Label>
            <Input
              id="ip"
              placeholder="172.16.0.1"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Chain Order</Label>
            <Input
              id="order"
              type="number"
              min={1}
              placeholder="Auto-assigned if empty"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers are checked first. Downstream gates depend on upstream ones.
            </p>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
