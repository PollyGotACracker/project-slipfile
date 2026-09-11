import { ThemeToggle } from "@/components/layouts/ThemeToggle";
import { Wordmark } from "@/components/layouts/Wordmark";
import { CreateRoomButton } from "@/components/landing/CreateRoomButton";
import { JoinRoomForm } from "@/components/landing/JoinRoomForm";
import { LandingBackground } from "@/components/landing/LandingBackground";

export function LandingView() {
  return (
    <div className="relative flex flex-1 flex-col">
      <LandingBackground />
      <div className="flex items-center justify-between px-6 pt-6 sm:px-10">
        <Wordmark size="lg" />
        <ThemeToggle />
      </div>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-6 text-center">
        <div className="flex-[3]" />
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-500">
          <h1 className="text-4xl leading-tight font-semibold tracking-tight text-balance break-keep sm:text-5xl">
            링크를 생성하고,
            <br />
            공유 공간에서 소통하세요.
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            서버 저장 없이 화면을 보고 대화하며 파일을 전달하세요.
          </p>
        </div>
        <div className="flex-[4]" />
        <div className="flex w-full max-w-xs flex-col items-center gap-5">
          <CreateRoomButton />
          <div className="flex w-full items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            또는
            <span className="h-px flex-1 bg-border" />
          </div>
          <JoinRoomForm />
        </div>
        <div className="flex-[4]" />
      </div>
    </div>
  );
}
