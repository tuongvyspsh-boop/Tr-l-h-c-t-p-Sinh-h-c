import React, { useState, useMemo, useRef } from 'react';
import { BiologyTerm } from '../types/biology';
import { biologyDataService } from '../services/biologyDataService';
import PronunciationButton from './PronunciationButton';

interface TeacherDashboardProps {
  terms: BiologyTerm[];
  onTermsUpdated: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  terms,
  onTermsUpdated,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterTopic, setFilterTopic] = useState('all');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<BiologyTerm | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<Partial<BiologyTerm>>({
    englishTerm: '',
    pronunciation: '',
    vietnameseTerm: '',
    grade: '12',
    topic: 'Di truyền học',
    definition: '',
    simpleExplanation: '',
    example: '',
    memoryTip: '',
    keywords: [],
  });
  const [keywordsText, setKeywordsText] = useState('');

  const [notification, setNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Distinct topics
  const topics = useMemo(() => {
    const set = new Set<string>();
    terms.forEach((t) => {
      if (t.topic) set.add(t.topic);
    });
    return Array.from(set);
  }, [terms]);

  // Filtered terms
  const filteredTerms = useMemo(() => {
    return terms.filter((t) => {
      const matchGrade = filterGrade === 'all' || t.grade === filterGrade;
      const matchTopic = filterTopic === 'all' || t.topic === filterTopic;
      const searchLow = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        t.englishTerm.toLowerCase().includes(searchLow) ||
        t.vietnameseTerm.toLowerCase().includes(searchLow) ||
        t.id.toLowerCase().includes(searchLow);
      return matchGrade && matchTopic && matchSearch;
    });
  }, [terms, filterGrade, filterTopic, searchTerm]);

  const handleOpenAdd = () => {
    setEditingTerm(null);
    setFormData({
      englishTerm: '',
      pronunciation: '',
      vietnameseTerm: '',
      grade: '12',
      topic: 'Di truyền học',
      definition: '',
      simpleExplanation: '',
      example: '',
      memoryTip: '',
      keywords: [],
    });
    setKeywordsText('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (term: BiologyTerm) => {
    setEditingTerm(term);
    setFormData({ ...term });
    setKeywordsText(term.keywords ? term.keywords.join(', ') : '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Thầy/Cô có chắc chắn muốn xóa thuật ngữ "${name}" (#${id})?`)) {
      await biologyDataService.deleteTerm(id);
      onTermsUpdated();
      showNotification(`Đã xóa thành công "${name}".`);
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.englishTerm || !formData.vietnameseTerm || !formData.definition) {
      alert('Vui lòng điền đủ: Thuật ngữ tiếng Anh, Tiếng Việt và Định nghĩa.');
      return;
    }

    const keywords = keywordsText
      .split(/[,;]+/)
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (editingTerm) {
      // Update
      const updated: BiologyTerm = {
        ...(formData as BiologyTerm),
        id: editingTerm.id,
        keywords: keywords.length > 0 ? keywords : [formData.englishTerm.toLowerCase()],
      };
      await biologyDataService.updateTerm(updated);
      showNotification(`Đã cập nhật thuật ngữ "${updated.englishTerm}".`);
    } else {
      // Add
      await biologyDataService.addTerm({
        englishTerm: formData.englishTerm,
        pronunciation: formData.pronunciation || '',
        vietnameseTerm: formData.vietnameseTerm,
        grade: (formData.grade as any) || '12',
        topic: formData.topic || 'Sinh học THPT',
        definition: formData.definition || '',
        simpleExplanation: formData.simpleExplanation || '',
        example: formData.example || '',
        memoryTip: formData.memoryTip || '',
        keywords: keywords.length > 0 ? keywords : [formData.englishTerm.toLowerCase()],
      });
      showNotification(`Đã thêm thành công thuật ngữ "${formData.englishTerm}".`);
    }

    setIsModalOpen(false);
    onTermsUpdated();
  };

  // CSV Export
  const handleExportCsv = () => {
    const csvContent = biologyDataService.exportToCsv();
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `biology_terms_sgk_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Đã xuất file CSV thành công!');
  };

  // CSV Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const count = biologyDataService.importFromCsv(content);
        onTermsUpdated();
        showNotification(`Đã nhập thành công ${count} thuật ngữ từ CSV!`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3 bg-teal-600 text-white rounded-xl shadow-md text-sm text-center font-medium animate-fadeIn">
          {notification}
        </div>
      )}

      {/* Header Panel */}
      <div className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <span>👩‍🏫</span>
              <span>Bảng Quản lý Dữ liệu Thuật ngữ Giáo viên</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Toàn bộ dữ liệu tại đây là nguồn chuẩn tuyệt đối được AI ưu tiên sử dụng để giảng dạy học sinh.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCsv}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <span>📥</span>
              <span>Xuất CSV</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <span>📤</span>
              <span>Nhập CSV</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <span>+ Thêm thuật ngữ mới</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-700">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tiếng Anh, tiếng Việt, mã..."
            className="p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />

          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            <option value="all">Tất cả khối lớp</option>
            <option value="10">Lớp 10</option>
            <option value="11">Lớp 11</option>
            <option value="12">Lớp 12</option>
          </select>

          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            <option value="all">Tất cả chủ đề ({topics.length})</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table of Terms */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs overflow-hidden">
        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>DANH SÁCH THUẬT NGỮ CHUẨN ({filteredTerms.length} kết quả)</span>
          <span>Hệ thống cơ sở dữ liệu: /data/biologyTerms.json</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="p-3">Mã</th>
                <th className="p-3">Thuật ngữ Tiếng Anh</th>
                <th className="p-3">Thuật ngữ Tiếng Việt</th>
                <th className="p-3">Lớp & Chủ đề</th>
                <th className="p-3 max-w-xs">Định nghĩa tóm tắt</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredTerms.map((term) => (
                <tr
                  key={term.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                >
                  <td className="p-3 font-mono font-bold text-teal-600 dark:text-teal-400">
                    {term.id}
                  </td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-1.5">
                      <span>{term.englishTerm}</span>
                      <PronunciationButton term={term.englishTerm} size="sm" showText={false} />
                    </div>
                    {term.pronunciation && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        {term.pronunciation}
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                    {term.vietnameseTerm}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      Lớp {term.grade}
                    </span>
                    <span className="block text-[11px] text-slate-400 mt-0.5 truncate max-w-[140px]">
                      {term.topic}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={term.definition}>
                    {term.definition}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap space-x-1">
                    <button
                      onClick={() => handleOpenEdit(term)}
                      className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-teal-50 hover:text-teal-600 transition-colors"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(term.id, term.englishTerm)}
                      className="px-2.5 py-1 text-xs font-semibold bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingTerm ? `Chỉnh sửa: ${editingTerm.englishTerm}` : 'Thêm thuật ngữ Sinh học mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Thuật ngữ Tiếng Anh *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.englishTerm || ''}
                    onChange={(e) => setFormData({ ...formData, englishTerm: e.target.value })}
                    placeholder="Ví dụ: Ribosome"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Phiên âm quốc tế
                  </label>
                  <input
                    type="text"
                    value={formData.pronunciation || ''}
                    onChange={(e) => setFormData({ ...formData, pronunciation: e.target.value })}
                    placeholder="Ví dụ: /ˈraɪ.bə.səʊm/"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Thuật ngữ Tiếng Việt chuẩn SGK *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.vietnameseTerm || ''}
                    onChange={(e) => setFormData({ ...formData, vietnameseTerm: e.target.value })}
                    placeholder="Ví dụ: Ribôxôm"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Khối lớp
                  </label>
                  <select
                    value={formData.grade || '12'}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-xs"
                  >
                    <option value="10">Lớp 10</option>
                    <option value="11">Lớp 11</option>
                    <option value="12">Lớp 12</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Chuyên đề / Chủ đề
                </label>
                <input
                  type="text"
                  value={formData.topic || ''}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="Ví dụ: Sinh học tế bào"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Định nghĩa chuẩn SGK *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.definition || ''}
                  onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                  placeholder="Định nghĩa chính xác theo chuẩn SGK GDPT 2018..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Giải thích dễ hiểu cho học sinh
                </label>
                <textarea
                  rows={2}
                  value={formData.simpleExplanation || ''}
                  onChange={(e) => setFormData({ ...formData, simpleExplanation: e.target.value })}
                  placeholder="Giải thích theo hình ảnh ẩn dụ, thực tế..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Ví dụ minh họa
                  </label>
                  <input
                    type="text"
                    value={formData.example || ''}
                    onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                    placeholder="Ví dụ cụ thể..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Gợi ý / Mẹo ghi nhớ
                  </label>
                  <input
                    type="text"
                    value={formData.memoryTip || ''}
                    onChange={(e) => setFormData({ ...formData, memoryTip: e.target.value })}
                    placeholder="Câu vần hoặc liên tưởng ngắn..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Từ khóa tìm kiếm (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={keywordsText}
                  onChange={(e) => setKeywordsText(e.target.value)}
                  placeholder="ribosome, riboxom, bao quan, dich ma..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                >
                  {editingTerm ? 'Lưu thay đổi' : 'Thêm vào cơ sở dữ liệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
