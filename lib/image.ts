/**
 * Supabase Storage 이미지 변환 헬퍼.
 *
 * 화면 표시용 이미지를 원본 그대로 내려주면 egress가 폭증한다.
 * (실측: 컷아웃 원본 14.5MB → width=1200 웹피 746KB, 썸네일 228KB)
 *
 * 공개 URL(/object/public/)만 변환 경로(/render/image/public/)로 바꾼다.
 * 서명 URL은 서명에 변환 옵션이 포함돼야 하므로 여기서 건드리지 않는다.
 * 다운로드 링크에는 쓰지 말 것 — 원본 품질이 필요하다.
 */

export interface TransformOpts {
  /** 표시 폭(px). 1~2500 */
  width?: number;
  height?: number;
  /** 20~100, 기본 75 */
  quality?: number;
  resize?: 'cover' | 'contain' | 'fill';
}

const PUBLIC_MARK = '/storage/v1/object/public/';
const RENDER_MARK = '/storage/v1/render/image/public/';

export function transformedUrl(
  url: string | null | undefined,
  opts: TransformOpts = {},
): string {
  if (!url) return '';
  // 이미 변환 경로거나 공개 URL이 아니면 그대로 사용
  if (url.includes(RENDER_MARK) || !url.includes(PUBLIC_MARK)) return url;

  const { width, height, quality = 75, resize } = opts;
  const params = new URLSearchParams();
  if (width) params.set('width', String(width));
  if (height) params.set('height', String(height));
  params.set('quality', String(quality));
  if (resize) params.set('resize', resize);

  const [base, hash] = url.split('#');
  const [path, existingQuery] = base.split('?');
  const rendered = path.replace(PUBLIC_MARK, RENDER_MARK);
  const query = existingQuery ? `${existingQuery}&${params}` : params.toString();
  return `${rendered}?${query}${hash ? `#${hash}` : ''}`;
}

/** 목록·그리드용 작은 썸네일 */
export function thumbUrl(url: string | null | undefined, width = 400): string {
  return transformedUrl(url, { width, quality: 70, resize: 'cover' });
}

/** 본문에 크게 보여주는 미리보기 (상세페이지 시안 등) */
export function previewUrl(url: string | null | undefined, width = 1200): string {
  return transformedUrl(url, { width, quality: 78 });
}
