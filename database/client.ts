import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase 브라우저 클라이언트를 생성하는 함수.
 * @param isSingleton 기존 클라이언트 재사용 여부. false면 연결 수명주기 분리.
 * @returns Supabase 브라우저 클라이언트.
 */
export function createClient(isSingleton = true) {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { isSingleton },
  );
}
