import {
  Anchor,
  Bell,
  Circle,
  Cloud,
  Diamond,
  Feather,
  Flame,
  Heart,
  Hexagon,
  Moon,
  Sparkles,
  Square,
  Star,
  Sun,
  Triangle,
  Zap,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// TODO: 아이콘 대신 Gravatar로 아바타 대체 가능성을 검토한다(이메일 값 필요).
export const AVATAR_ICONS = [
  Circle,
  Square,
  Triangle,
  Hexagon,
  Star,
  Diamond,
  Zap,
  Flame,
  Heart,
  Cloud,
  Sun,
  Moon,
  Bell,
  Anchor,
  Feather,
  Sparkles,
];

/**
 * 랜덤 아바타 인덱스를 반환하는 함수.
 * `exclude`를 주면 해당 인덱스는 제외하고 고른다.
 */
export function getRandomAvatarIndex(exclude?: number): number {
  if (AVATAR_ICONS.length <= 1) return 0;
  let index = Math.floor(Math.random() * AVATAR_ICONS.length);
  if (exclude !== undefined) {
    while (index === exclude)
      index = Math.floor(Math.random() * AVATAR_ICONS.length);
  }
  return index;
}

function getInitials(nickname: string): string {
  return nickname.slice(0, 2).toUpperCase();
}

interface ParticipantAvatarProps {
  nickname: string;
  avatarIndex?: number;
  className?: string;
  iconClassName?: string;
}

export function ParticipantAvatar({
  nickname,
  avatarIndex,
  className,
  iconClassName,
}: ParticipantAvatarProps) {
  const Icon =
    avatarIndex !== undefined
      ? AVATAR_ICONS[avatarIndex % AVATAR_ICONS.length]
      : null;

  return (
    <Avatar className={className}>
      <AvatarFallback className="text-xs">
        {Icon ? (
          <Icon className={iconClassName ?? "size-3.5"} />
        ) : (
          getInitials(nickname)
        )}
      </AvatarFallback>
    </Avatar>
  );
}
