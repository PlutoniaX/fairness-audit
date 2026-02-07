import { create } from 'zustand';
import type { LLMProvider, ChatSession } from '@/types/llm';
import { createLocalStoragePersistence } from './middleware/persistence';

interface SettingsState {
  // API keys (stored in browser only)
  apiKeys: Record<LLMProvider, string>;
  activeProvider: LLMProvider;

  // UI preferences
  sidebarCollapsed: boolean;
  darkMode: boolean;

  // Chat sessions
  chatSessions: ChatSession[];

  // Audit list
  auditList: Array<{ id: string; name: string; createdAt: number; updatedAt: number }>;
  activeAuditId: string | null;
}

interface SettingsActions {
  setApiKey: (provider: LLMProvider, key: string) => void;
  setActiveProvider: (provider: LLMProvider) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setDarkMode: (dark: boolean) => void;
  addChatSession: (session: ChatSession) => void;
  updateChatSession: (id: string, updates: Partial<ChatSession>) => void;
  addAudit: (audit: { id: string; name: string }) => void;
  removeAudit: (id: string) => void;
  setActiveAuditId: (id: string | null) => void;
  _persist: () => void;
}

type SettingsStore = SettingsState & SettingsActions;

const persistence = createLocalStoragePersistence<SettingsState>({
  name: 'fairness-audit-settings',
  debounceMs: 300,
});

const defaultSettings: SettingsState = {
  apiKeys: { gemini: '', claude: '', openai: '' },
  activeProvider: 'gemini',
  sidebarCollapsed: false,
  darkMode: false,
  chatSessions: [],
  auditList: [],
  activeAuditId: null,
};

export const useSettingsStore = create<SettingsStore>((set, get) => {
  const saved = typeof window !== 'undefined' ? persistence.load() : null;
  const initial = saved ? { ...defaultSettings, ...saved } : defaultSettings;

  return {
    ...initial,

    _persist() {
      const { _persist, setApiKey, setActiveProvider, setSidebarCollapsed, setDarkMode, addChatSession, updateChatSession, addAudit, removeAudit, setActiveAuditId, ...data } = get();
      persistence.save(data as SettingsState);
    },

    setApiKey(provider, key) {
      set(s => ({ apiKeys: { ...s.apiKeys, [provider]: key } }));
      get()._persist();
    },

    setActiveProvider(provider) {
      set({ activeProvider: provider });
      get()._persist();
    },

    setSidebarCollapsed(collapsed) {
      set({ sidebarCollapsed: collapsed });
      get()._persist();
    },

    setDarkMode(dark) {
      set({ darkMode: dark });
      get()._persist();
    },

    addChatSession(session) {
      set(s => ({ chatSessions: [...s.chatSessions, session] }));
      get()._persist();
    },

    updateChatSession(id, updates) {
      set(s => ({
        chatSessions: s.chatSessions.map(cs => cs.id === id ? { ...cs, ...updates } : cs),
      }));
      get()._persist();
    },

    addAudit(audit) {
      set(s => ({
        auditList: [...s.auditList, { ...audit, createdAt: Date.now(), updatedAt: Date.now() }],
      }));
      get()._persist();
    },

    removeAudit(id) {
      set(s => ({
        auditList: s.auditList.filter(a => a.id !== id),
        activeAuditId: s.activeAuditId === id ? null : s.activeAuditId,
      }));
      get()._persist();
    },

    setActiveAuditId(id) {
      set({ activeAuditId: id });
      get()._persist();
    },
  };
});
