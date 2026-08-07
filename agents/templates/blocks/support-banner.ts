/**
 * 하나파워온스토어 지원사업 고지 배너.
 *
 * 의뢰서 Step 4에서 기업이 "상세페이지 하단에 지원사업 배너가 삽입되는 것에 동의합니다"를
 * 체크해야 제출되므로, 생성되는 모든 상세페이지 맨 아래에 붙인다.
 *
 * 렌더 규칙:
 * - 폰트는 페이지에 이미 임베드된 --font-body만 참조한다. 새 폰트를 선언하면 폰트
 *   화이트리스트 게이트에 걸리고, 헤드리스 리눅스 렌더에서 한글이 깨진다.
 * - 스타일은 전부 인라인 — 변형 CSS·FONT_ROLE_LOCK 같은 !important 규칙과 섞이지 않는다.
 */

const TEAL = '#009d7d'
const RED = '#e2483a'

export function supportBannerHtml(width: number): string {
  const pad = Math.round(width * 0.055) // 872px 기준 48px

  return `<section data-name="hpo-support-banner" data-arch="banner" style="box-sizing:border-box;width:100%;background:#f4faf8;border-top:3px solid ${TEAL};padding:${pad}px;display:flex;align-items:center;gap:${pad}px">
  <div style="flex:0 0 auto;font-family:var(--font-body);font-weight:800;line-height:1.04">
    <span style="display:block;color:${TEAL};font-size:26px">Hana</span>
    <span style="display:block;color:${RED};font-size:36px">Power On</span>
    <span style="display:block;color:${TEAL};font-size:18px;letter-spacing:0.06em">Store</span>
  </div>
  <div style="flex:1 1 auto;min-width:0;font-family:var(--font-body);color:#2c4a44">
    <p style="margin:0;font-size:25px;line-height:1.5;font-weight:700">본 상세페이지는 <span style="color:${TEAL}">하나파워온스토어 소상공인 지원사업</span>을 통해 제작되었습니다.</p>
  </div>
</section>`
}
