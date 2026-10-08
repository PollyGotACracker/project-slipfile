import { ThemeToggle } from "@/components/layouts/ThemeToggle";
import { Wordmark } from "@/components/layouts/Wordmark";

/** 페이지 상단 공통 헤더 */
export function PageHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 sm:px-6">
      <Wordmark />
      <ThemeToggle />
    </header>
  );
}
