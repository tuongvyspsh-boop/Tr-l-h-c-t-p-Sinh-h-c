import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-6 px-4 border-t border-slate-800 text-center text-xs space-y-1.5 shrink-0">
      <div className="flex items-center justify-center gap-2 font-bold text-slate-200 text-sm">
        <span className="text-teal-400">🧬</span>
        <span>TRỢ LÝ SINH HỌC SGK</span>
      </div>
      <p className="text-slate-400">Sản phẩm hỗ trợ học tập Sinh học THPT</p>
      <p className="text-slate-500 text-[11px]">
        Dữ liệu do giáo viên quản lý và cập nhật • Chuẩn Chương trình GDPT 2018–2028
      </p>
    </footer>
  );
};

export default Footer;
