import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useState } from "react";

export default function QuizConfigModal({ isOpen, onClose, onSave }) {
  const [config, setConfig] = useState({
    'multiple-choice': 4,
    'true-false': 2,
    'short-answer': 2
  });

  const adjustCount = (type, increment) => {
    setConfig(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] + increment)
    }));
  };

  const handleSave = () => {
    const total = Object.values(config).reduce((sum, count) => sum + count, 0);
    if (total === 0) {
      return; // Maybe show an error toast
    }
    onSave(config);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Quiz Questions</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Set the number of each type of question you want in your quiz.
        </DialogDescription>

        <div className="space-y-4 py-4">
          {Object.entries(config).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <span className="capitalize">{type.replace('-', ' ')}</span>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => adjustCount(type, -1)}
                >
                  -
                </Button>
                <span className="w-8 text-center">{count}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => adjustCount(type, 1)}
                >
                  +
                </Button>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}