import type { HouseMenu } from '../../../lib/content/schema';
import type { HouseMenuReason, OrderResult } from './types';

export function houseMenu(menu: HouseMenu, reason: HouseMenuReason): OrderResult {
  return { kind: 'house-menu', reason, menu };
}
