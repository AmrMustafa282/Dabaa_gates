"use client";

import type { GateStatus } from "@/lib/gate-status";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2 } from "lucide-react";

export function GateActions({
  gate,
  onEdit,
  onDelete,
}: {
  gate: GateStatus;
  onEdit: (gate: { id: string; name: string; ip: string; order: number }) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() =>
          onEdit({
            id: gate.id,
            name: gate.name,
            ip: gate.ip,
            order: gate.order,
          })
        }
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {gate.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the gate from monitoring.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(gate.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
