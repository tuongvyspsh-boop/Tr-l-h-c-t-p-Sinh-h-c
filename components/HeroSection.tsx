import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl p-5 md:p-6 mb-4 shadow-sm border border-teal-900/40 relative overflow-hidden">
      {/* Decorative DNA swirl and molecule visuals */}
      <div className="absolute -right-8 -bottom-10 w-44 h-44 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 -top-10 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-2">
          <span>🧬</span>
          <span>Chương trình Giáo dục Phổ thông 2018–2028</span>
        </div>

        <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight text-white mb-2">
          Tra cứu thuật ngữ Sinh học nhanh và chính xác
        </h2>

        <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
          Hỗ trợ học sinh THPT tra cứu thuật ngữ Sinh học tiếng Anh – tiếng Việt theo dữ liệu chuẩn do giáo viên biên soạn, kèm phát âm và mẹo ghi nhớ thông minh.
        </p>

        <div className="flex items-center gap-4 mt-3 text-xs text-teal-300 font-medium flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            Cơ sở dữ liệu 30+ thuật ngữ trọng tâm
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Phát âm tiếng Anh chuẩn quốc tế
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Flashcard & Trắc nghiệm ôn thi
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
