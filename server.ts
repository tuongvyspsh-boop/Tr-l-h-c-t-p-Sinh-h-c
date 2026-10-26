import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SYSTEM_INSTRUCTION = `Bạn là "Trợ lý Sinh học SGK", hỗ trợ học sinh THPT Việt Nam học Sinh học theo Chương trình GDPT 2018.

Nguyên tắc:
1. Ưu tiên tuyệt đối dữ liệu Sinh học được cung cấp trong CONTEXT (nếu có).
2. Không được tự ý sửa thuật ngữ chuẩn đã có trong CONTEXT.
3. Không được khẳng định thông tin ngoài CONTEXT là nội dung SGK.
4. Nếu không có dữ liệu chuẩn trong CONTEXT, hãy ghi rõ:
"Thuật ngữ này chưa có trong cơ sở dữ liệu chuẩn của giáo viên."
Sau đó, nếu bạn có thể giải thích, hãy đặt trong một mục riêng có tiêu đề:
"📌 Gợi ý tham khảo từ AI (chưa được giáo viên xác nhận)"
5. Giải thích bằng tiếng Việt dễ hiểu, phù hợp học sinh THPT.
6. Khi có thuật ngữ tiếng Anh:
- Hiển thị thuật ngữ
- Phiên âm
- Nghĩa tiếng Việt
7. Trả lời ngắn gọn, rõ ràng, chia thành các phần rõ rệt (Định nghĩa, Giải thích dễ hiểu, Ví dụ, Gợi ý ghi nhớ).
8. Có thể dùng ví dụ trực quan đời sống để học sinh dễ hiểu.
9. Không tạo thông tin hoặc nguồn tài liệu giả. Tuyệt đối không bịa kiến thức.
10. Nếu câu hỏi hoàn toàn không liên quan đến Sinh học:
Trả lời:
"Mình là trợ lý Sinh học. Bạn hãy hỏi mình một nội dung liên quan đến Sinh học nhé."`;

async function main() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '5mb' }));

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      app: 'TRỢ LÝ SINH HỌC SGK',
      hasApiKey: !!apiKey,
    });
  });

  // Chat completion endpoint via Gemini
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, contextTerm } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Nội dung câu hỏi không được để trống.' });
      }

      let promptWithContext = message;
      if (contextTerm) {
        promptWithContext = `[CONTEXT DỮ LIỆU CHUẨN CỦA GIÁO VIÊN]:
- Thuật ngữ tiếng Anh: ${contextTerm.englishTerm}
- Phiên âm: ${contextTerm.pronunciation}
- Thuật ngữ tiếng Việt: ${contextTerm.vietnameseTerm}
- Lớp: ${contextTerm.grade} - Chủ đề: ${contextTerm.topic}
- Định nghĩa chuẩn SGK: ${contextTerm.definition}
- Giải thích dễ hiểu: ${contextTerm.simpleExplanation}
- Ví dụ: ${contextTerm.example}
- Mẹo ghi nhớ: ${contextTerm.memoryTip}

[CÂU HỎI CỦA HỌC SINH]:
${message}

Dựa trên dữ liệu chuẩn ở CONTEXT, hãy trả lời câu hỏi của học sinh theo cấu trúc 7 phần rõ ràng:
1. THUẬT NGỮ TIẾNG ANH
2. PHIÊN ÂM
3. THUẬT NGỮ TIẾNG VIỆT
4. ĐỊNH NGHĨA NGẮN GỌN
5. GIẢI THÍCH DỄ HIỂU
6. VÍ DỤ
7. GỢI Ý GHI NHỚ`;
      } else {
        promptWithContext = `[LƯU Ý: KHÔNG TÌM THẤY TRONG DỮ LIỆU CHUẨN CỦA GIÁO VIÊN]
[CÂU HỎI CỦA HỌC SINH]:
${message}

Hãy thông báo: "Thuật ngữ này chưa có trong cơ sở dữ liệu chuẩn của giáo viên."
Sau đó, nếu đây là câu hỏi Sinh học, cung cấp:
"📌 Gợi ý tham khảo từ AI (chưa được giáo viên xác nhận)" với cấu trúc dễ hiểu.
Nếu không phải câu hỏi Sinh học, nhắc nhở học sinh theo nguyên tắc 10.`;
      }

      let textResult = '';
      // Try gemini-flash-latest or gemini-3.8-flash
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: promptWithContext,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.3,
          },
        });
        textResult = response.text || '';
      } catch (err: any) {
        console.warn('First model attempt failed, trying gemini-3.8-flash:', err?.message);
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptWithContext,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.3,
          },
        });
        textResult = response.text || '';
      }

      return res.json({ text: textResult });
    } catch (err: any) {
      console.error('Chat API Error:', err);
      return res.status(503).json({
        error: 'Hệ thống AI đang tạm thời không phản hồi. Bạn vẫn có thể tra cứu dữ liệu Sinh học chuẩn.',
      });
    }
  });

  // Setup Vite dev server or static files
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TRỢ LÝ SINH HỌC SGK server đang chạy tại http://0.0.0.0:${PORT}`);
  });
}

main().catch(console.error);
