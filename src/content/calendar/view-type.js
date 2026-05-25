import { VIEW_TYPES, DOM_REBUILD_WAIT_MS } from '../../shared/constants.js';

const VALID_VIEW_TYPES = new Set(VIEW_TYPES.map(v => v.id));

/**
 * Google カレンダーの表示形式を、ページリロードなしで切り替える
 *
 * URL パスの /r/{viewType} 部分を history.pushState で書き換え、
 * popstate イベントを発火して Google カレンダーの SPA ルーターに反応させる。
 *
 * @param {string} viewType - 切り替え先の viewType（VIEW_TYPES の id）
 * @returns {Promise<{ success: boolean, reason?: 'invalid_view_type' | 'unsupported_url_format', alreadyInTargetView?: boolean }>}
 */
export async function switchViewType(viewType) {
  if (!VALID_VIEW_TYPES.has(viewType)) {
    return { success: false, reason: 'invalid_view_type' };
  }

  const currentMatch = location.href.match(/\/r\/([^/?#]+)/);
  if (currentMatch && currentMatch[1] === viewType) {
    // 直前に手動切替された直後の DOM 未確定状態に踏み込まないよう、最低 1 フレーム空ける
    await new Promise(resolve => requestAnimationFrame(resolve));
    return { success: true, alreadyInTargetView: true };
  }

  const newUrl = location.href.replace(/\/r\/[^/?#]+/, `/r/${viewType}`);
  if (newUrl === location.href) {
    return { success: false, reason: 'unsupported_url_format' };
  }

  history.pushState({}, '', newUrl);
  window.dispatchEvent(new PopStateEvent('popstate'));

  // popstate 直後はカレンダー一覧の DOM が detach → re-mount される瞬間で、
  // 続けて applyPreset を実行すると古いチェックボックスを操作してしまうため待機する
  await new Promise(resolve => requestAnimationFrame(resolve));
  await new Promise(resolve => setTimeout(resolve, DOM_REBUILD_WAIT_MS));

  return { success: true };
}
