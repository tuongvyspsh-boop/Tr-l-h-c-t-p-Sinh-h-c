import React, { useState, useEffect, useRef } from 'react';
import { ActiveTab, BiologyTerm, ChatMessage as ChatMessageType } from './types/biology';
import { biologyDataService } from './services/biologyDataService';
import { askBiologyAssistant } from './services/geminiService';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import QuickTerms from './components/QuickTerms';
import SearchBox from './components/SearchBox';
import ChatMessage from './components/ChatMessage';
import Flashcard from './components/Flashcard';
import Quiz from './components/Quiz';
import Favorites from './components/Favorites';
import History from './components/History';
import TeacherDashboard from './components/TeacherDashboard';
import Footer from './components/Footer';

const FAVORITES_STORAGE_KEY = 'bio_sgk_favorites';
const HISTORY_STORAGE_KEY = 'bio_sgk_history';

const INITIAL_GREETING: ChatMessageType = {
  id: 'init-msg',
  sender: 'assistant',
  timestamp: Date.now(),
  text: `Chào bạn! Mình là **Trợ lý Sinh học SGK**, đồng hành cùng bạn học đúng thuật ngữ và hiểu đúng kiến thức Sinh học theo **Chương trình GDPT 2018**.

Bạn có thể:
- Gõ thuật ngữ tiếng Anh hoặc tiếng Việt (Ví dụ: \`Gene\`, \`DNA\`, \`Mitosis\`, \`Phiên mã\`...)
- Đặt câu hỏi (Ví dụ: *"Gene là gì?"*, *"Chromosome nghĩa là gì?"*, *"Operon Lac hoạt động thế nào?"*...)
- Sử dụng các nút tra cứu nhanh bên dưới để xem thẻ thuật ngữ chuẩn!`,
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [terms, setTerms] = useState<BiologyTerm[]>([]);
  const [messages, setMessages] = useState<ChatMessageType[]>([INITIAL_GREETING]);
  const [isLoading, setIsLoading] = useState(false);

  // Favorites & History from localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['BIO001', 'BIO002', 'BIO004'];
    } catch {
      return ['BIO001', 'BIO002'];
    }
  });

  const [historyList, setHistoryList] = useState<{ query: string; timestamp: number }[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load terms on mount
  const refreshTerms = async () => {
    const all = await biologyDataService.getAllTerms();
    setTerms(all);
  };

  useEffect(() => {
    refreshTerms();
  }, []);

  // Sync favorites
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.warn('Failed to save favorites to localStorage:', e);
    }
  }, [favorites]);

  // Sync history
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyList));
    } catch (e) {
      console.warn('Failed to save history to localStorage:', e);
    }
  }, [historyList]);

  // Auto scroll chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab, isLoading]);

  const handleToggleFavorite = (term: BiologyTerm) => {
    setFavorites((prev) => {
      if (prev.includes(term.id)) {
        return prev.filter((id) => id !== term.id);
      } else {
        return [...prev, term.id];
      }
    });
  };

  const handleClearFavorites = () => {
    setFavorites([]);
  };

  const handleClearHistory = () => {
    setHistoryList([]);
  };

  const handleRemoveHistoryItem = (index: number) => {
    setHistoryList((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Main Search & Chat Flow:
   * 1. Add user message
   * 2. Save query to history
   * 3. Search local database first!
   * 4. Call server-side Gemini AI to elaborate
   */
  const handleSearch = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const trimmed = queryText.trim();

    // 1. User Message
    const userMsg: ChatMessageType = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: Date.now(),
    };

    // 2. Append to History
    setHistoryList((prev) => [
      { query: trimmed, timestamp: Date.now() },
      ...prev.filter((h) => h.query.toLowerCase() !== trimmed.toLowerCase()).slice(0, 29),
    ]);

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 3. Search Local Biology Database First
      const searchResult = await biologyDataService.searchTerm(trimmed);
      const matchedTerm = searchResult.bestMatch;

      // 4. Call Server-Side Gemini
      const aiResponse = await askBiologyAssistant(trimmed, matchedTerm);

      let botText: string | undefined = undefined;
      let aiSuggestedAnswer: string | undefined = undefined;
      let unrecognizedQuery = false;

      if (matchedTerm) {
        // Found in standard database
        if (aiResponse.text) {
          aiSuggestedAnswer = aiResponse.text;
        }
      } else {
        // Not found in standard database
        unrecognizedQuery = true;
        if (aiResponse.text) {
          aiSuggestedAnswer = aiResponse.text;
        } else if (aiResponse.error) {
          botText = `${aiResponse.error}\n\nThuật ngữ này chưa có trong cơ sở dữ liệu chuẩn của giáo viên.`;
        }
      }

      const assistantMsg: ChatMessageType = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        timestamp: Date.now(),
        text: botText,
        matchedTerm,
        unrecognizedQuery,
        aiSuggestedAnswer,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Search error:', err);
      // Fallback: still show local database match if any
      const searchResult = await biologyDataService.searchTerm(trimmed).catch(() => ({ bestMatch: undefined, matches: [] }));
      const assistantMsg: ChatMessageType = {
        id: `bot-err-${Date.now()}`,
        sender: 'assistant',
        timestamp: Date.now(),
        matchedTerm: searchResult.bestMatch,
        text: searchResult.bestMatch
          ? undefined
          : 'Hệ thống AI đang tạm thời không phản hồi. Bạn vẫn có thể tra cứu dữ liệu Sinh học chuẩn.',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFromHistory = (queryText: string) => {
    setActiveTab('chat');
    handleSearch(queryText);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased overflow-hidden">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        favoritesCount={favorites.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-3 md:p-6">
        <div className="max-w-4xl mx-auto h-full flex flex-col justify-between">
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <HeroSection />
                <QuickTerms
                  onSelectTerm={(term) => handleSearch(term)}
                  disabled={isLoading}
                />

                {/* Conversation List */}
                <div className="space-y-4 pb-4">
                  {messages.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      favorites={favorites}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs animate-pulse">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-600 flex items-center justify-center font-bold">
                        🧬
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-teal-600 dark:text-teal-400">
                          Đang tra cứu cơ sở dữ liệu chuẩn & tổng hợp câu trả lời...
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Kiểm tra SGK GDPT 2018 • Đối chiếu thuật ngữ quốc tế
                        </p>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'flashcard' && (
            <div className="py-2">
              <Flashcard
                terms={terms}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="py-2">
              <Quiz terms={terms} />
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="py-2">
              <Favorites
                terms={terms}
                favoriteIds={favorites}
                onToggleFavorite={handleToggleFavorite}
                onClearFavorites={handleClearFavorites}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="py-2">
              <History
                historyList={historyList}
                onSelectQuery={handleSelectFromHistory}
                onClearHistory={handleClearHistory}
                onRemoveItem={handleRemoveHistoryItem}
              />
            </div>
          )}

          {activeTab === 'teacher' && (
            <div className="py-2">
              <TeacherDashboard
                terms={terms}
                onTermsUpdated={refreshTerms}
              />
            </div>
          )}
        </div>
      </main>

      {/* Persistent Chat Input when in Chat tab */}
      {activeTab === 'chat' && (
        <SearchBox onSearch={handleSearch} isLoading={isLoading} />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;