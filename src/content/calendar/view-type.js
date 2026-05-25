/**
 * Google カレンダーの表示形式を、ページリロードなしで切り替える
 *
 * URL パスの /r/{viewType} 部分を history.pushState で書き換え、
 * popstate イベントを発火して Google カレンダーの SPA ルーターに反応させる。
 *
 * @param {string} viewType - 切り替え先の viewType（'day' / 'week' / 'month' など）
 * @returns {Promise<{ success: boolean, reason?: string, alreadyInTargetView?: boolean }>}
 */
export async function switchViewType(viewType) {
  if (location.href.includes(`/r/${viewType}`)) {
    return { success: true, alreadyInTargetView: true };
  }

  const newUrl = location.href.replace(/\/r\/[^/?#]*/, `/r/${viewType}`);
  if (newUrl === location.href) {
    return { success: false, reason: 'unsupported_url_format' };
  }

  history.pushState({}, '', newUrl);
  window.dispatchEvent(new PopStateEvent('popstate'));

  return { success: true };
}
