import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * 기업 관리번호(01-001 · 02-001 …) 조회.
 *
 * 하나파워온 사무국은 관리번호로 기업을 식별한다(엑셀·시트 기준). projects.client_id에는
 * FK가 없어 중첩 select로 가져올 수 없으므로 별도 조회해 Map으로 돌려준다.
 */
export async function fetchManageIds(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 서비스 클라이언트 제네릭이 화면마다 달라 any로 받는다
  svc: SupabaseClient<any, any, any>,
  clientIds: (string | null | undefined)[],
): Promise<Map<string, string>> {
  const ids = [...new Set(clientIds.filter((v): v is string => !!v))]
  if (ids.length === 0) return new Map()

  const { data } = await svc
    .from('user_profiles')
    .select('id, manage_id')
    .in('id', ids)

  return new Map(
    (data ?? [])
      .filter((r: { manage_id: string | null }) => !!r.manage_id)
      .map((r: { id: string; manage_id: string | null }) => [r.id, r.manage_id as string]),
  )
}
