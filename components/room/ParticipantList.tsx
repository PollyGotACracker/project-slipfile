import { ScrollArea } from "@/components/ui/scroll-area";
import { ParticipantRow } from "@/components/room/ParticipantRow";
import type { Participant } from "@/types/participant";

export function ParticipantList({ participants }: { participants: Participant[] }) {
  return (
    <ScrollArea className="h-full">
      <ul className="space-y-0.5 p-1">
        {participants.map((participant, index) => (
          <ParticipantRow
            key={participant.id}
            participant={participant}
            style={{ animationDelay: `${index * 40}ms` }}
          />
        ))}
      </ul>
    </ScrollArea>
  );
}
