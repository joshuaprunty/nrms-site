import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@radix-ui/react-dialog";

export default function DeleteStoryModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  storyTitle,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Story</DialogTitle>
        </DialogHeader>
        <DialogDescription className="py-4">
          Are you sure you want to delete "{storyTitle}"? This action cannot be
          undone.
        </DialogDescription>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
          
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Story"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
