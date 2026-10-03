import { ListMusic } from "lucide-react";
import { IconButton } from "@/components/common/IconButton";
import { useQueueStore } from "@/stores";

export interface QueueButtonProps {
  onOpen?: () => void;
}

export function QueueButton({ onOpen }: QueueButtonProps) {
  const count = useQueueStore((state) => state.tracks.length);

  return (
    <IconButton label={`Queue (${count})`} size="sm" tone="subtle" onClick={onOpen}>
      <ListMusic size={16} aria-hidden="true" />
    </IconButton>
  );
}
