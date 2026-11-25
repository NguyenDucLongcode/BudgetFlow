/**
 * Helper function để lấy tên hiển thị theo ngôn ngữ hiện tại (i18n).
 * Hỗ trợ cả Category và Wallet (hoặc bất kỳ model nào có nameVi, nameEn, name).
 *
 * @param item Object chứa nameVi, nameEn hoặc name
 * @param locale Ngôn ngữ hiện tại ('vi' | 'en')
 * @returns Tên đã được bản địa hóa
 */
export function getLocalizedName(
  item?: {
    nameVi?: string | null;
    nameEn?: string | null;
    name?: string | null;
  } | null,
  locale?: string,
): string {
  if (!item) return '';

  if (locale === 'en' && item.nameEn && item.nameEn.trim()) {
    return item.nameEn;
  }

  return item.nameVi || item.name || '';
}

export default getLocalizedName;
