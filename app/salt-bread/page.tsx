import type { Metadata } from "next";
import Image from "next/image";
import localFont from "next/font/local";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  ChefHat,
  Clock3,
  Flame,
  Heart,
  Leaf,
  PackageCheck,
  Ruler,
  ShieldCheck,
  Truck,
  Wheat,
} from "lucide-react";

const pretendard = localFont({
  variable: "--font-pretendard",
  display: "swap",
  src: [
    {
      path: "../../assets/fonts/Pretendard-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../assets/fonts/Pretendard-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../assets/fonts/Pretendard-ExtraBold.otf",
      weight: "800",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "천연발효종 강릉 고메코나 소금빵",
  description:
    "아빠의 마음으로 구운 천연발효종 강릉 고메코나 소금빵 상세페이지",
};

const cutouts = {
  front: "/salt-bread/saltbread-01.webp",
  angle: "/salt-bread/saltbread-02.webp",
  top: "/salt-bread/saltbread-03.webp",
  side: "/salt-bread/saltbread-04.webp",
};

const cutoutDimensions: Record<string, { width: number; height: number }> = {
  [cutouts.front]: { width: 1000, height: 401 },
  [cutouts.angle]: { width: 1000, height: 649 },
  [cutouts.top]: { width: 1000, height: 500 },
  [cutouts.side]: { width: 1000, height: 447 },
};

type ProofItem = {
  label: string;
  value: string;
  Icon: LucideIcon;
};

const heroBadges = ["강릉 소금빵 맛집 1위", "당일생산 당일판매", "천연발효종 24시간 저온숙성"];

const proofItems: ProofItem[] = [
  {
    label: "천연발효종",
    value: "이스트 대신 자체 배양 효모를 24시간 저온숙성해 속 편한 풍미를 만듭니다.",
    Icon: Wheat,
  },
  {
    label: "앵커 무염버터",
    value: "뉴질랜드 청정산 동물성 버터로 고소한 향과 부드러운 여운을 살렸습니다.",
    Icon: Leaf,
  },
  {
    label: "화학첨가물 NO",
    value: "방부제와 인공향료를 덜어내고 가족에게 권할 수 있는 재료만 고릅니다.",
    Icon: ShieldCheck,
  },
  {
    label: "계란·우유 NO",
    value: "알레르기 걱정을 줄인 레시피로 아이 간식과 가족 식탁에 잘 어울립니다.",
    Icon: Heart,
  },
];

const textureNotes: ProofItem[] = [
  {
    label: "버터동굴",
    value: "넉넉한 앵커 무염버터가 빵 안쪽에 고소한 향의 빈 공간을 남깁니다.",
    Icon: Flame,
  },
  {
    label: "페이스트리 결",
    value: "크로와상처럼 길게 밀어 성형해 겉은 바삭하고 결은 얇게 살아납니다.",
    Icon: ChefHat,
  },
  {
    label: "80-90g 대용량",
    value: "한 개만으로도 든든한 크기라 아이 간식과 아침 대용으로 충분합니다.",
    Icon: Ruler,
  },
];

const deliveryItems: ProofItem[] = [
  {
    label: "개별 포장",
    value: "위생적으로 하나씩 담아 보관과 나눔이 편합니다.",
    Icon: PackageCheck,
  },
  {
    label: "냉동 2개월",
    value: "냉동 보관으로 신선함을 오래 유지할 수 있습니다.",
    Icon: Clock3,
  },
  {
    label: "에어프라이어 1분",
    value: "해동 후 짧게 데우면 갓 구운 듯한 바삭함이 돌아옵니다.",
    Icon: Flame,
  },
  {
    label: "전국 배송",
    value: "강릉에서 오늘 구운 빵을 신선하게 보내드립니다.",
    Icon: Truck,
  },
];

function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.28em] text-[#a96f20]">
      {children}
    </p>
  );
}

function ProductImage({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const dimensions = cutoutDimensions[src] ?? { width: 1800, height: 1200 };

  return (
    <Image
      src={src}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
      priority={priority}
      className={`h-auto w-full object-contain drop-shadow-[0_32px_38px_rgba(81,44,16,0.2)] ${className}`}
      sizes="(max-width: 768px) 92vw, 760px"
    />
  );
}

function ProofList({ items, dark = false }: { items: ProofItem[]; dark?: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map(({ label, value, Icon }) => (
        <div
          key={label}
          className={`group rounded-[8px] border p-5 transition duration-300 hover:-translate-y-1 ${
            dark
              ? "border-white/10 bg-white/[0.055] text-[#f8efe3]"
              : "border-[#ead8bd] bg-white/70 text-[#241b15] shadow-[0_18px_45px_rgba(118,78,32,0.08)]"
          }`}
        >
          <div
            className={`mb-5 flex size-10 items-center justify-center rounded-[8px] ${
              dark ? "bg-[#f5a623]/15 text-[#f5c36b]" : "bg-[#f9e2ad] text-[#9b6216]"
            }`}
          >
            <Icon size={20} strokeWidth={1.8} />
          </div>
          <h3 className="text-[19px] font-extrabold tracking-[-0.01em]">{label}</h3>
          <p
            className={`mt-2 text-[15px] leading-7 ${
              dark ? "text-[#e8d8bf]/78" : "text-[#665344]"
            }`}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function SaltBreadPage() {
  return (
    <main
      className={`${pretendard.variable} min-h-screen bg-[#d9d2c6] font-[var(--font-pretendard)] text-[#241b15]`}
    >
      <div className="mx-auto max-w-[980px] overflow-hidden bg-[#fff8eb] shadow-[0_0_90px_rgba(38,27,16,0.22)]">
        <section className="relative isolate min-h-[100dvh] overflow-hidden px-6 pb-14 pt-8 sm:px-10 lg:px-14">
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_78%_18%,rgba(245,166,35,0.28),transparent_28%),linear-gradient(150deg,#fff8eb_0%,#f2dfbd_54%,#c08a43_100%)]" />
          <div className="absolute inset-0 -z-10 opacity-[0.18] [background-image:linear-gradient(90deg,rgba(68,42,19,0.12)_1px,transparent_1px),linear-gradient(0deg,rgba(68,42,19,0.1)_1px,transparent_1px)] [background-size:36px_36px]" />

          <nav className="flex items-center justify-between gap-4 text-[13px] font-bold text-[#3d2b1d]">
            <span className="tracking-[0.16em]">GOMEKONA</span>
            <a
              href="#order"
              className="rounded-full border border-[#3d2b1d]/20 bg-white/45 px-4 py-2 text-[12px] transition hover:bg-white/75 active:translate-y-[1px]"
            >
              오늘 생산분 보기
            </a>
          </nav>

          <div className="grid min-h-[calc(100dvh-110px)] items-center gap-8 py-12 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="max-w-[560px]">
              <SectionKicker>natural starter salt bread</SectionKicker>
              <h1 className="text-[clamp(42px,8.5vw,82px)] font-extrabold leading-[0.98] tracking-[-0.045em] text-[#231810]">
                아빠의 마음으로 구운 강릉 소금빵
              </h1>
              <div className="relative my-7 lg:hidden">
                <div className="absolute left-[8%] top-[16%] h-[66%] w-[80%] rounded-full bg-[#f5a623]/18 blur-3xl" />
                <div className="relative rounded-[8px] border border-white/45 bg-white/20 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-[2px]">
                  <ProductImage
                    src={cutouts.angle}
                    alt="강릉 고메코나 소금빵 모바일 히어로 제품 이미지"
                    priority
                    className="rotate-[-2deg] scale-[1.13]"
                  />
                </div>
              </div>
              <p className="mt-7 max-w-[520px] text-[18px] leading-8 text-[#49392d] sm:text-[20px]">
                우리 딸에게 먹일 수 있는 정직한 빵을 만들고 싶었습니다. 천연발효종,
                앵커 무염버터, 당일생산 원칙으로 속 편하고 고소한 한 입을 전합니다.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {heroBadges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-[#c8913d]/30 bg-[#fffdf7]/75 px-4 py-2 text-[13px] font-bold text-[#6e4614]"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <div className="mt-10 grid grid-cols-3 divide-x divide-[#332114]/15 border-y border-[#332114]/15 py-5">
                <div className="pr-4">
                  <p className="text-[26px] font-extrabold tracking-[-0.04em]">80-90g</p>
                  <p className="mt-1 text-[12px] font-bold text-[#7b5f4a]">든든한 크기</p>
                </div>
                <div className="px-4">
                  <p className="text-[26px] font-extrabold tracking-[-0.04em]">24h</p>
                  <p className="mt-1 text-[12px] font-bold text-[#7b5f4a]">저온숙성</p>
                </div>
                <div className="pl-4">
                  <p className="text-[26px] font-extrabold tracking-[-0.04em]">NO</p>
                  <p className="mt-1 text-[12px] font-bold text-[#7b5f4a]">화학첨가물</p>
                </div>
              </div>
            </div>

            <div className="relative mx-auto hidden w-full max-w-[720px] lg:block">
              <div className="absolute left-[7%] top-[13%] h-[58%] w-[80%] rounded-full bg-[#f5a623]/18 blur-3xl" />
              <div className="relative -mr-2 rounded-[8px] border border-white/45 bg-white/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-[2px] sm:p-6">
                <ProductImage
                  src={cutouts.angle}
                  alt="강릉 고메코나 소금빵 사선 제품 이미지"
                  priority
                  className="rotate-[-2deg] scale-[1.08]"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#211712] px-6 py-24 text-[#fbf3e8] sm:px-10 lg:px-14">
          <div className="absolute inset-0 opacity-60 [background:radial-gradient(circle_at_20%_12%,rgba(245,166,35,0.18),transparent_30%),radial-gradient(circle_at_90%_90%,rgba(78,112,77,0.24),transparent_36%)]" />
          <div className="relative grid gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:items-end">
            <div>
              <SectionKicker>brand promise</SectionKicker>
              <h2 className="text-[clamp(34px,6vw,58px)] font-extrabold leading-tight tracking-[-0.04em]">
                우리 딸 먹일 빵집의 약속
              </h2>
              <p className="mt-6 text-[17px] leading-8 text-[#e8d8bf]/82">
                고메코나 소금빵은 가족에게 먼저 권할 수 있는 기준에서 출발했습니다.
                마가린과 트랜스지방을 덜어내고, 재료의 이름이 분명한 빵만 굽습니다.
              </p>
            </div>

            <div className="rounded-[8px] border border-white/10 bg-white/[0.07] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-[8px] bg-[#f5a623]/18 text-[#f5c36b]">
                  <BadgeCheck size={23} strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-[22px] font-extrabold tracking-[-0.02em]">
                    강원도 사회적기업이 만드는 정직한 베이커리
                  </h3>
                  <p className="mt-3 text-[16px] leading-8 text-[#f4e7d2]/78">
                    지역 취약계층 빵 나눔을 정기적으로 이어가며, 강릉에서 매일 구운 빵의
                    신선함을 전국 식탁으로 보냅니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-0 bg-[#f7ead2] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative min-h-[520px] overflow-hidden bg-[linear-gradient(135deg,#f5e1bf,#fff8eb_52%,#ccd6bf)] p-8 sm:p-12">
            <div className="absolute inset-x-12 bottom-10 h-12 rounded-full bg-[#5d3718]/16 blur-xl" />
            <ProductImage
              src={cutouts.top}
              alt="소금 결정이 보이는 고메코나 소금빵 상단 이미지"
              className="relative top-14 scale-[1.25] rotate-[3deg] lg:top-24 lg:scale-[1.38]"
            />
          </div>
          <div className="px-6 py-20 sm:px-10 lg:px-12">
            <SectionKicker>texture notes</SectionKicker>
            <h2 className="text-[clamp(32px,5.4vw,54px)] font-extrabold leading-tight tracking-[-0.04em]">
              겉은 바삭하게, 속은 촉촉하게
            </h2>
            <p className="mt-5 text-[17px] leading-8 text-[#614c3d]">
              한 입 베어 물면 버터 향이 먼저 올라오고, 얇게 접힌 결 사이로 고소한 풍미가
              오래 남습니다.
            </p>
            <div className="mt-8 space-y-4">
              {textureNotes.map(({ label, value, Icon }) => (
                <div
                  key={label}
                  className="grid grid-cols-[42px_1fr] gap-4 border-t border-[#d6ba8f] pt-5"
                >
                  <div className="flex size-10 items-center justify-center rounded-[8px] bg-[#2f2117] text-[#f5c36b]">
                    <Icon size={19} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="text-[20px] font-extrabold tracking-[-0.02em]">{label}</h3>
                    <p className="mt-1 text-[15px] leading-7 text-[#6b5545]">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#fffaf2] px-6 py-24 sm:px-10 lg:px-14">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-8">
              <SectionKicker>ingredients</SectionKicker>
              <h2 className="text-[clamp(32px,5vw,52px)] font-extrabold leading-tight tracking-[-0.04em]">
                아이도, 어른도 편하게 먹는 재료 기준
              </h2>
              <p className="mt-5 text-[17px] leading-8 text-[#624d3e]">
                꼭 필요한 것만 남겨 소금빵 본연의 향과 식감을 살렸습니다. 과장보다 매일
                지킬 수 있는 기준을 더 중요하게 봅니다.
              </p>
            </div>
            <ProofList items={proofItems} />
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#3a2417] px-6 py-24 text-[#fbf3e8] sm:px-10 lg:px-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(245,166,35,0.34),transparent_28%),linear-gradient(125deg,#4a2b17_0%,#1f1714_62%,#31402f_100%)]" />
          <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.24)_48%,transparent_52%)] [background-size:190px_190px]" />
          <div className="relative grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <SectionKicker>sensory moment</SectionKicker>
              <h2 className="text-[clamp(34px,6vw,62px)] font-extrabold leading-tight tracking-[-0.045em]">
                버터 향이 터지는 따뜻한 순간
              </h2>
              <p className="mt-6 text-[18px] leading-9 text-[#f3dfbd]/82">
                24시간 저온숙성된 천연발효종의 은은한 발효향, 앵커 무염버터의 고소함,
                표면의 굵은 소금 결정이 차례로 느껴집니다.
              </p>
            </div>
            <div className="relative min-h-[420px]">
              <div className="absolute inset-x-8 bottom-10 h-20 rounded-full bg-black/28 blur-2xl" />
              <ProductImage
                src={cutouts.side}
                alt="윤기 있는 고메코나 소금빵 측면 이미지"
                className="absolute left-1/2 top-1/2 max-w-[760px] -translate-x-1/2 -translate-y-1/2 scale-[1.18]"
              />
            </div>
          </div>
        </section>

        <section className="bg-[#eef2e6] px-6 py-24 sm:px-10 lg:px-14">
          <div className="mx-auto max-w-[780px]">
            <SectionKicker>size comparison</SectionKicker>
            <h2 className="text-[clamp(32px,5vw,52px)] font-extrabold leading-tight tracking-[-0.04em]">
              한 개만으로 든든한 80-90g 대용량
            </h2>
            <p className="mt-5 text-[17px] leading-8 text-[#4f5d42]">
              일반 소금빵보다 넉넉한 크기로 간식은 물론 아침 대용으로도 만족감이 큽니다.
            </p>

            <div className="mt-12 space-y-8">
              <div className="grid items-center gap-5 border-t border-[#bdc9ad] pt-7 sm:grid-cols-[150px_1fr]">
                <div>
                  <p className="text-[15px] font-extrabold text-[#4c5b3f]">일반 소금빵</p>
                  <p className="mt-1 text-[13px] text-[#69775d]">40-50g</p>
                </div>
                <div className="relative h-24 overflow-hidden rounded-[8px] bg-white/45">
                  <ProductImage
                    src={cutouts.front}
                    alt="일반 소금빵과 비교되는 작은 크기 예시"
                    className="absolute left-5 top-1/2 max-w-[330px] -translate-y-1/2 opacity-55 grayscale"
                  />
                </div>
              </div>

              <div className="grid items-center gap-5 border-t border-[#bdc9ad] pt-7 sm:grid-cols-[150px_1fr]">
                <div>
                  <p className="text-[15px] font-extrabold text-[#26311f]">고메코나 소금빵</p>
                  <p className="mt-1 text-[13px] text-[#58664e]">80-90g</p>
                </div>
                <div className="relative h-32 overflow-hidden rounded-[8px] bg-[#fff8eb] shadow-[0_20px_50px_rgba(66,78,48,0.12)]">
                  <ProductImage
                    src={cutouts.front}
                    alt="고메코나 소금빵 대용량 크기 이미지"
                    className="absolute left-4 top-1/2 max-w-[560px] -translate-y-1/2"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#fff8eb] px-6 py-24 sm:px-10 lg:px-14">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <SectionKicker>fresh delivery</SectionKicker>
              <h2 className="text-[clamp(32px,5vw,52px)] font-extrabold leading-tight tracking-[-0.04em]">
                오늘 구운 빵을 정성스럽게 포장합니다
              </h2>
              <p className="mt-5 text-[17px] leading-8 text-[#624d3e]">
                개별 포장으로 위생적이고 보관이 편합니다. 냉동 보관 후 짧게 데우면 표면의
                바삭함과 버터 향이 다시 살아납니다.
              </p>
              <div className="mt-8">
                <ProofList items={deliveryItems} />
              </div>
            </div>
            <div className="relative min-h-[440px] overflow-hidden rounded-[8px] bg-[linear-gradient(145deg,#dbc49d,#f9eedc_48%,#ffffff)] p-7">
              <div className="absolute left-8 top-8 h-32 w-32 rounded-full border border-[#8f6a3d]/20" />
              <div className="absolute bottom-10 right-8 h-24 w-40 rotate-[-10deg] rounded-[8px] border border-[#8f6a3d]/25 bg-[#b78a55]/18" />
              <ProductImage
                src={cutouts.angle}
                alt="포장 안내와 함께 배치된 고메코나 소금빵"
                className="relative top-24 scale-[1.28] rotate-[-8deg]"
              />
            </div>
          </div>
        </section>

        <section
          id="order"
          className="relative overflow-hidden bg-[#1d1612] px-6 py-24 text-[#fff8eb] sm:px-10 lg:px-14"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,166,35,0.45),transparent_36%),linear-gradient(180deg,#2d2018_0%,#17110f_100%)]" />
          <div className="relative mx-auto max-w-[760px] text-center">
            <SectionKicker>daily baked only</SectionKicker>
            <h2 className="text-[clamp(34px,6vw,64px)] font-extrabold leading-tight tracking-[-0.045em]">
              오늘 구운 빵만 보냅니다
            </h2>
            <p className="mx-auto mt-6 max-w-[610px] text-[18px] leading-9 text-[#f2dfbd]/82">
              매일 한정 수량만 생산합니다. 아빠의 마음으로 구운 정직한 소금빵을 우리
              가족의 식탁에서 나눠보세요.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-full bg-[#f5a623] px-7 py-4 text-[15px] font-extrabold text-[#20150d] shadow-[0_18px_36px_rgba(245,166,35,0.22)] transition hover:bg-[#f8bd4c] active:translate-y-[1px]"
              >
                한정수량 주문하기
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/[0.06] px-7 py-4 text-[15px] font-extrabold text-[#fff8eb] transition hover:bg-white/[0.1] active:translate-y-[1px]"
              >
                보관 방법 확인
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
