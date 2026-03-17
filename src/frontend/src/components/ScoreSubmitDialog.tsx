import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trophy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSubmitScore } from "../hooks/useQueries";

interface ScoreSubmitDialogProps {
  open: boolean;
  onClose: () => void;
  gameId: string;
  gameName: string;
  score: number;
}

export function ScoreSubmitDialog({
  open,
  onClose,
  gameId,
  gameName,
  score,
}: ScoreSubmitDialogProps) {
  const [name, setName] = useState("");
  const { mutateAsync, isPending } = useSubmitScore();

  const handleSubmit = async () => {
    if (!name.trim()) return;
    try {
      await mutateAsync({ game: gameId, playerName: name.trim(), score });
      toast.success("Score submitted!", {
        description: `${name}: ${score.toLocaleString()} pts`,
      });
      setName("");
      onClose();
    } catch {
      toast.error("Failed to submit score");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-sm border-border"
        style={{ background: "oklch(0.13 0.028 258)" }}
        data-ocid="score.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-orbitron text-sm uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 neon-text-yellow" />
            Game Over!
          </DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-4">
          <div
            className="text-center p-4 rounded-xl"
            style={{ background: "oklch(0.16 0.03 258)" }}
          >
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              {gameName} — Final Score
            </p>
            <p className="font-orbitron text-3xl font-black neon-text-cyan mt-1">
              {score.toLocaleString()}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Your Name
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              className="border-border/50"
              style={{ background: "oklch(0.17 0.03 258)" }}
              data-ocid="score.input"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border/50 text-muted-foreground"
            data-ocid="score.cancel_button"
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || isPending}
            className="glow-btn border-0 text-white"
            data-ocid="score.submit_button"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Submit Score
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
