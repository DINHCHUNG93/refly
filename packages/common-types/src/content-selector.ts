import { Source } from '@refly/openapi-schema';
import { SyncMarkEventName } from './extension-messaging';

export type MarkScope = 'block' | 'inline';

export type TextType = 'text' | 'table' | 'link' | 'image' | 'video' | 'audio';
export type MarkType =
  | 'resource'
  | 'note'
  | 'collection'
  | 'extensionWeblink'
  | 'noteSelection'
  | 'resourceSelection'
  | 'extensionWeblinkSelection';

/**
 * 1. extension-weblink: represent the weblink in the extension
 * 2. noteCursor: represent the note cursor related selection
 */
export const selectedTextDomains = [
  'resource',
  'note',
  'extensionWeblink',
  'noteCursorSelection',
  'noteBeforeCursorSelection',
  'noteAfterCursorSelection',
];
export type ContextDomain = 'weblink' | 'resource' | 'note' | 'collection' | 'selected-text';
// selected text card domain
export type SelectedTextDomain =
  | 'resource'
  | 'note'
  | 'extensionWeblink'
  | 'noteCursorSelection'
  | 'noteBeforeCursorSelection'
  | 'noteAfterCursorSelection';

// extend mark to unify selected text and database entity
export interface Mark {
  id?: string; // unique id
  entityId?: string; // if has entity id, it means it is a database entity
  title?: string; // entity name, include extensionWeblink
  url?: string | (() => string) | (() => void); // entity url, include extensionWeblink
  type: MarkType; // 类型
  name?: string; // mark name
  active?: boolean; // mark active
  textType?: TextType; // 内容类型
  data: string;
  target?: HTMLElement;
  xPath: string; // 该元素对应的 xPath 路径，这个可以当做唯一 id
  scope: MarkScope; // 是块级还是内联元素
  domain: SelectedTextDomain; // 该元素对应的 domain, for selected text card
  cleanup?: () => void; // 清理函数
  icon?: React.ReactNode; // 图标
}

export interface Selection {
  xPath: string;
  content: string;
  type: TextType;
}

export interface Data {
  version: string; // 浏览器插件所属的版本，方便制定兼容策略
  type: 'partial-content' | 'whole-content' | 'link'; // 是前端全部内容、部分内容、还是直接通过 link 处理
  source: Source; // 网页 Meta
  marks: Mark[];
  userId: string; // 是否需要 by User 保存，到时候可以推荐给其他人是这个人的策略
}

export type SyncMarkEventType = 'add' | 'remove' | 'reset';

export interface SyncMarkEvent {
  name: SyncMarkEventName; //'syncMarkEvent' | 'syncMarkEventBack';
  body: {
    type: SyncMarkEventType;
    mark?: Mark;
  };
}

export type SyncStatusEventType = 'start' | 'update' | 'stop' | 'reset';

export interface SyncStatusEvent {
  name: SyncMarkEventName;
  body: {
    type: SyncStatusEventType;
    scope: MarkScope;
    enableMultiSelect?: boolean;
    showContentSelector?: boolean;
  };
}
