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

  // Google カレンダーのパスは /calendar/.../r[/{viewType}[/...]] の形式
  // パスを '/' でセグメント分割し、'r' セグメントを起点に viewType を置換または挿入する
  const url = new URL(location.href);
  const segments = url.pathname.split('/');
  const rIndex = segments.indexOf('r');
  if (rIndex === -1) {
    return { success: false, reason: 'unsupported_url_format' };
  }

  // r の次のセグメントが現在の viewType。
  // ・undefined → パスが /r で終わる
  // ・''        → パスが /r/ で終わる
  // ・それ以外  → /r/{viewType}[/...]
  const currentViewType = segments[rIndex + 1];

  if (currentViewType === viewType) {
    // 直前に手動切替された直後の DOM 未確定状態に踏み込まないよう、最低 1 フレーム空ける
    await new Promise(resolve => requestAnimationFrame(resolve));
    return { success: true, alreadyInTargetView: true };
  }

  if (currentViewType === undefined) {
    segments.push(viewType);
  } else if (currentViewType === '' || VALID_VIEW_TYPES.has(currentViewType)) {
    // 既存 view の置換。後続セグメント（日付やイベントID 等の view 用コンテキスト）は保持
    segments[rIndex + 1] = viewType;
  } else {
    // /r/eventedit/{id} のような view 以外のモード。後続はそのモード専用フォーマットで
    // view URL では描画できないため、コンテキストごと破棄してクリーンな /r/{view} にする
    segments.length = rIndex + 1;
    segments.push(viewType);
  }
  url.pathname = segments.join('/');

  history.pushState({}, '', url.href);
  window.dispatchEvent(new PopStateEvent('popstate'));

  // popstate 直後はカレンダー一覧の DOM が detach → re-mount される瞬間で、
  // 続けて applyPreset を実行すると古いチェックボックスを操作してしまうため待機する
  await new Promise(resolve => requestAnimationFrame(resolve));
  await new Promise(resolve => setTimeout(resolve, DOM_REBUILD_WAIT_MS));

  return { success: true };
}
