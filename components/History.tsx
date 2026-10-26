import React from 'react';

interface HistoryProps {
  historyList: { query: string; timestamp: number }[];
  onSelectQuery: (query: string) => void;
  onClearHistory: () => void;
  onRemoveItem: (index: number) => void;
}

const History: React.FC<HistoryProps> = ({
  historyList,
  onSelectQuery,
  onClearHistory,
  onRemoveItem,
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <span>📜</span>
            <span>Lịch sử tra cứu gần đây</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Lưu trên trình duyệt của bạn ({historyList.length} lượt tìm kiếm)
          </p>
        </div>

        {historyList.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            Xóa lịch sử
          </button>
        )}
      </div>

      {historyList.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2">
          <div className="text-4xl">🔍</div>
          <h4 className="font-bold text-slate-700 dark:text-slate-200 text-base">
            Chưa có lịch sử tra cứu
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Các câu hỏi và từ khóa bạn tra cứu sẽ tự động xuất hiện tại đây để tiện xem lại.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs divide-y divide-slate-100 dark:divide-slate-700/60 overflow-hidden">
          {historyList.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer group"
              onClick={() => onSelectQuery(item.query)}
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 text-sm">
                  🔎
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-300">
                    {item.query}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(item.timestamp).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-teal-600 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                  Tra cứu lại ➔
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(idx);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  title="Xóa mục này"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
