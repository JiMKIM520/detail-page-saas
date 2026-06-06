/**
 * (호환 shim) 식품 슬롯 템플릿은 프로덕션 위치로 이전됨.
 * 정식 소스: agents/templates/slots/food-slot.ts
 * 기존 proof 스크립트(render-food-sample.ts 등) 호환용 re-export.
 */
export {
  renderFoodDetail,
  foodCopySchema,
  foodDetailSchema,
  type FoodTokens,
  type FoodDetailData,
  type FoodCopyData,
} from '../agents/templates/slots/food-slot'
