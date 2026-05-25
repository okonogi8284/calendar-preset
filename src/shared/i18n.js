// i18n ユーティリティ

import { VIEW_TYPES } from './constants.js';

/**
 * 現在のUIロケールが日本語かどうかを判定
 * @returns {boolean} 日本語の場合true
 */
export function isJapanese() {
  const uiLanguage = chrome.i18n.getUILanguage();
  return uiLanguage.startsWith('ja');
}

/**
 * ローカライズされたメッセージを取得
 * @param {string} key メッセージキー
 * @param {string|string[]} substitutions プレースホルダーの置換値
 * @returns {string} ローカライズされたメッセージ
 */
export function getMessage(key, substitutions) {
  return chrome.i18n.getMessage(key, substitutions) || key;
}

/**
 * 表示形式のラベルを取得（i18n対応）
 * @param {string} viewType 表示形式のキー（VIEW_TYPES の id）
 * @returns {string} ローカライズされたラベル
 */
export function getViewTypeLabel(viewType) {
  if (!viewType) return '-';

  const entry = VIEW_TYPES.find(v => v.id === viewType);
  if (!entry) return viewType;

  const message = chrome.i18n.getMessage(entry.labelKey);
  return message || entry.fallback;
}

/**
 * HTMLのdata-i18n属性を持つ要素を翻訳
 */
export function translatePage() {
  try {
    // data-i18n属性を持つ要素のテキストを翻訳
    document.querySelectorAll('[data-i18n]').forEach(element => {
      try {
        const key = element.getAttribute('data-i18n');
        const message = chrome.i18n.getMessage(key);
        // 翻訳が取得できた場合のみテキストを更新（空の場合は既存テキストを維持）
        if (message) {
          element.textContent = message;
        }
      } catch (e) {
        console.warn('Failed to translate element:', element, e);
      }
    });

    // data-i18n-placeholder属性を持つ要素のplaceholderを翻訳
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      try {
        const key = element.getAttribute('data-i18n-placeholder');
        const message = chrome.i18n.getMessage(key);
        // 翻訳が取得できた場合のみplaceholderを更新（空の場合は既存を維持）
        if (message) {
          element.placeholder = message;
        }
      } catch (e) {
        console.warn('Failed to translate placeholder:', element, e);
      }
    });

    // html lang属性を現在のロケールに設定
    document.documentElement.lang = isJapanese() ? 'ja' : 'en';
  } catch (e) {
    console.error('Failed to translate page:', e);
  }
}
