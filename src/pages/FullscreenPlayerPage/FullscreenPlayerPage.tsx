import { AnimatePresence } from "motion/react";
import { Content } from "@/components/layout/Content";
import { FullscreenPlayer } from "@/components/player/Fullscreen/FullscreenPlayer";

export interface FullscreenPlayerPageProps {
  onMinimize: () => void;
}

export function FullscreenPlayerPage({ onMinimize }: FullscreenPlayerPageProps) {
  return (
    <Content>
      <AnimatePresence>
        <FullscreenPlayer onMinimize={onMinimize} />
      </AnimatePresence>
    </Content>
  );
}
