
import React, { useState, useEffect, useRef } from 'react';
import { ArticleContent } from './components/ArticleContent';
import { EDITOR_INSIGHTS, NOTE_ARTICLE_TEXT } from './constants';
import { getEditorAdvice } from './services/geminiService';
import { ChatMessage } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'read' | 'editor'>('read');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [userProfile, setUserProfile] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // URLパラメータのチェック
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'editor') {
      setActiveTab('editor');
    }
    
    // 現在のプロトコルがfile://の場合は警告的に空にする
    const isLocalFile = window.location.protocol === 'file:';
    const baseUrl = isLocalFile ? 'https://あなたの公開サイトのURL.com' : window.location.href.split('?')[0].split('#')[0];
    setCustomUrl(baseUrl);
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCopyForNote = () => {
    navigator.clipboard.writeText(NOTE_ARTICLE_TEXT).then(() => {
      triggerToast('📋 記事本文をコピーしました！');
    });
  };

  const generateFinalUrl = () => {
    // 末尾の/を調整して?tab=editorを付与
    let base = customUrl.trim();
    if (!base) return '';
    base = base.endsWith('/') ? base.slice(0, -1) : base;
    return `${base}?tab=editor`;
  };

  const handleConfirmCopyLink = () => {
    const finalUrl = generateFinalUrl();
    if (!finalUrl || finalUrl.includes('あなたの公開サイトのURL')) {
      alert('正しいURL（https://...）を入力してください。');
      return;
    }
    navigator.clipboard.writeText(finalUrl).then(() => {
      triggerToast('🔗 診断URLをコピーしました！');
      setShowUrlModal(false);
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newMsg: ChatMessage = { role: 'user', text: userInput };
    setMessages(prev => [...prev, newMsg]);
    setUserInput('');
    setIsTyping(true);

    try {
      const response = await getEditorAdvice(userProfile || "一般的な副業検討者", userInput);
      setMessages(prev => [...prev, { role: 'model', text: response || "申し訳ありません。回答を生成できませんでした。" }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "エラーが発生しました。時間を置いて再度お試しください。" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl animate-bounce text-sm font-bold flex items-center gap-2 whitespace-nowrap">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* URL Confirmation Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
            <h3 className="text-xl font-bold text-slate-800 mb-2">診断リンクの生成</h3>
            
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                ⚠️ <strong>注意</strong>: 現在プレビュー中のURLは自分しかアクセスできません。noteに貼るには、GitHub Pagesなどで<strong>公開した後のURL</strong>をここに入力してください。
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">公開後のサイトURL</label>
              <input 
                type="text" 
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                placeholder="https://your-name.github.io/app-name"
              />
              <div className="mt-4 p-3 bg-slate-900 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">noteに貼るリンクのプレビュー</p>
                <code className="text-xs text-blue-400 break-all">{generateFinalUrl()}</code>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowUrlModal(false)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                閉じる
              </button>
              <button 
                onClick={handleConfirmCopyLink}
                className="flex-1 px-4 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                URLをコピー
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">E</div>
            <span className="font-bold text-slate-800">Editor Pro <span className="text-blue-600">2026</span></span>
          </div>
          <nav className="flex gap-2 sm:gap-4">
            <button 
              onClick={() => setActiveTab('read')}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'read' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              記事を読む
            </button>
            <button 
              onClick={() => setActiveTab('editor')}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'editor' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              編集者に相談
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full">
        {activeTab === 'read' ? (
          <div className="relative">
            {/* Action Bar */}
            <div className="flex justify-end gap-2 mb-8 sticky top-[80px] z-40 pointer-events-none">
              <button 
                onClick={handleCopyForNote}
                className="pointer-events-auto flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full text-sm font-bold text-slate-700 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all active:scale-95"
                title="記事本文をコピー"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>
                本文をコピー
              </button>
              <button 
                onClick={() => setShowUrlModal(true)}
                className="pointer-events-auto flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full text-sm font-bold text-blue-700 shadow-sm hover:shadow-md hover:bg-blue-100 transition-all active:scale-95"
                title="診断ページへのURLをコピー"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.002 4.002 0 0 1-.128-1.287z"/>
                  <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
                </svg>
                診断URLを生成
              </button>
            </div>

            {/* Editor Sidebar */}
            <div className="hidden lg:block fixed left-8 top-32 w-64 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">編集者の推敲ポイント</h5>
              <div className="space-y-4">
                {EDITOR_INSIGHTS.map((insight, idx) => (
                  <div key={idx} className="group">
                    <p className="text-xs font-bold text-blue-600 mb-1">{insight.section}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{insight.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Article Render */}
            <ArticleContent />

            {/* Bottom Call to Action */}
            <div className="mt-20 p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-4 text-center">あなたのAI副業適性を診断しませんか？</h3>
              <p className="text-blue-100 text-center mb-8">
                現在の仕事や得意なことを教えてください。編集者（AI）が2026年の戦略に沿った具体的なアドバイスを提供します。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setActiveTab('editor')}
                  className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg"
                >
                  診断をスタートする
                </button>
                <button 
                  onClick={() => setShowUrlModal(true)}
                  className="bg-blue-500/30 backdrop-blur-sm border border-blue-400/50 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-500/50 transition-colors"
                >
                  note貼付用のリンクを生成
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col h-[700px] overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">AI副業 伴走メンター</h2>
                <p className="text-xs text-slate-500">2026年の国策トレンドに基づいたアドバイスを提供します</p>
              </div>
              <button 
                onClick={() => setMessages([])}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                履歴をクリア
              </button>
            </div>

            <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-[#f8fafc]">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center px-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl mb-4">✍️</div>
                  <h3 className="font-bold text-slate-800 mb-2">まずはプロフィールを入力しましょう</h3>
                  <p className="text-sm text-slate-500 mb-6">
                    「現在は営業職です」「動画編集を勉強中です」など、あなたの状況を教えてください。
                  </p>
                  <input 
                    type="text" 
                    value={userProfile}
                    onChange={(e) => setUserProfile(e.target.value)}
                    placeholder="例：40代・事務職・週末のみ活動可能"
                    className="w-full max-w-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              )}
              
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                    <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="質問を入力してください..."
                  className="flex-grow p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button 
                  type="submit"
                  disabled={isTyping || !userInput.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold disabled:bg-slate-300 transition-colors"
                >
                  送信
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 text-center">
                ※Gemini 3 Flash を使用して回答を生成しています。正確な判断はご自身の責任で行ってください。
              </p>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm mb-4">© 2024 AI Side Hustle Editor Project. Built with Gemini API.</p>
          <div className="flex justify-center gap-6 text-slate-300 text-xs uppercase tracking-widest font-bold">
            <a href="#" className="hover:text-blue-500 transition-colors">利用規約</a>
            <a href="#" className="hover:text-blue-500 transition-colors">プライバシーポリシー</a>
            <a href="#" className="hover:text-blue-500 transition-colors">お問い合わせ</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
