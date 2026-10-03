import { ListMusic } from "lucide-react";
import { IconButton } from "@/components/common/IconButton";

export interface QueueButtonProps {
  queueLength: number;
  onOpen?: () => void;
}

export function QueueButton({ queueLength, onOpen }: QueueButtonProps) {
  return (
    <IconButton label={`Queue (${queueLength})`} size="sm" tone="subtle" onClick={onOpen}>
      <ListMusic size={16} aria-hidden="true" />
    </IconButton>
  );
}
