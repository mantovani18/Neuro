import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <Button variant="secondary" size="sm" onClick={onClose} className="px-2">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {children}
      </div>
    </div>
  );
}
