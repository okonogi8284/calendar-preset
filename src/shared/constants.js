// URLパターン
export const CALENDAR_URL_PATTERN = 'calendar.google.com';
export const CALENDAR_URL_MATCH = 'https://calendar.google.com/*';

// デフォルト設定
export const DEFAULT_SETTINGS = {
  saveViewTypeByDefault: true,
  applyViewTypeByDefault: true
};

/**
 * デフォルトのincludePrimary設定
 * 「全て解除」機能実行時に、プライマリカレンダー（最初のカレンダー）を解除するかどうかの設定
 *
 * - true: プライマリカレンダーも含めて全て解除
 * - false: プライマリカレンダーを残して他のカレンダーのみ解除（デフォルト）
 *
 * プライマリカレンダーは通常、ユーザーのメインカレンダーを指します（共有カレンダーやサブカレンダーではない）
 */
export const DEFAULT_INCLUDE_PRIMARY = false;

// スクロール設定
export const SCROLL_STEP_RATIO = 0.8; // 画面の80%ずつスクロール
export const SCROLL_STEP_MIN = 200;   // 最小スクロール量（px）
export const SCROLL_DELAY = 20;       // スクロール間の待機時間（ms）

/**
 * 仮想スクロール処理の早期終了判定の閾値
 *
 * スクロール中に新しいチェックボックスが見つからない状態が
 * この回数連続で続いた場合、全てのチェックボックスを処理したと判断して
 * スクロールを終了します。
 *
 * 仮想スクロールではDOMの更新にラグがあるため、1回見つからなかっただけでは
 * 終了せず、複数回確認することで信頼性を確保しています。
 */
export const MAX_NO_NEW_CHECKBOX_COUNT = 3;

// サイドパネル設定
export const SIDEPANEL_MIN_INTERVAL = 50; // 最小間隔（ms）

// 入力制限
export const MAX_PRESET_NAME_LENGTH = 100;
// カレンダー項目検出時の最大テキスト長
export const MAX_CALENDAR_TEXT_LENGTH = 200;

/**
 * サポートする表示形式の一覧
 *
 * Google カレンダーの URL パス `/r/{id}` に対応する viewType と、
 * i18n 表示用のメッセージキー・英語フォールバックの組。
 *
 * 新しい表示形式を追加する場合はここに 1 行追加するだけで、
 * view-type.js / utils.js / i18n.js すべてに反映される。
 * ただし対応する labelKey のメッセージは _locales/{ja,en}/messages.json
 * の両方に追加すること。
 */
export const VIEW_TYPES = [
  { id: 'day', labelKey: 'viewTypeDay', fallback: 'Day' },
  { id: 'week', labelKey: 'viewTypeWeek', fallback: 'Week' },
  { id: 'month', labelKey: 'viewTypeMonth', fallback: 'Month' },
  { id: 'year', labelKey: 'viewTypeYear', fallback: 'Year' },
  { id: 'agenda', labelKey: 'viewTypeAgenda', fallback: 'Schedule' },
  { id: 'customweek', labelKey: 'viewTypeCustomWeek', fallback: 'Custom (Week)' },
  { id: 'customday', labelKey: 'viewTypeCustomDay', fallback: 'Custom (Day)' }
];

// SPA ルーティング（switchViewType）で DOM が再構築されるまで待つ時間（ms）
export const DOM_REBUILD_WAIT_MS = 150;

/**
 * カレンダーグループ判定用キーワード
 * 折りたたまれているグループを展開する際に、カレンダーグループかどうかを判定するために使用
 * 新しい言語を追加する場合はここにキーワードを追加
 */
export const CALENDAR_GROUP_KEYWORDS = [
  // 日本語
  'カレンダー',
  'マイ',
  '他の',
  // 英語
  'calendar',
  'My',
  'Other'
];

/**
 * 検索フィールド判定用キーワード
 * カレンダーチェックボックス検出時に検索フィールドを除外するために使用
 * 新しい言語を追加する場合はここにキーワードを追加
 */
export const SEARCH_FIELD_KEYWORDS = [
  // 日本語
  '検索',
  // 英語
  'search'
];
