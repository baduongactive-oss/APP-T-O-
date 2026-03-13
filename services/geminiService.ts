import { GoogleGenAI } from "@google/genai";
import { ExamConfig } from "../types";

const createClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing from environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const generateExamContent = async (config: ExamConfig): Promise<string> => {
  const ai = createClient();

  // Determine if we are using a user-provided source text or generating from scratch
  const hasSourceText = !!config.sourceText && config.sourceText.trim().length > 0;

    const systemInstruction = `
    Bạn là một chuyên gia khảo thí tiếng Anh (ESL/EFL) chuyên nghiệp (Cambridge/IELTS Examiner).
    
    MỤC TIÊU: Tạo đề thi mới giữ nguyên CẤU TRÚC (Structure/Format) của đề mẫu nhưng thay đổi hoàn toàn NỘI DUNG (Content) và ĐIỂM KIẾN THỨC (Test Points).

    --------------------------------------------------------
    1. QUY TẮC "ANTI-CLONING" & "KNOWLEDGE VARIATION" (QUAN TRỌNG NHẤT):
    - GIỮ FORMAT, ĐỔI TEST POINT: 
      + Nếu câu 1 đề mẫu là MCQ kiểm tra "Comparison" (So sánh), câu 1 đề mới cũng là MCQ nhưng PHẢI kiểm tra điểm ngữ pháp KHÁC (ví dụ: "Conditional Type 1", "Passive Voice", "Wish clauses") dựa trên danh sách Grammar user cung cấp.
      + Nếu câu 2 đề mẫu kiểm tra từ vựng về "Environment", câu 2 đề mới nên kiểm tra từ vựng về chủ đề KHÁC (ví dụ: "Technology", "Education") nếu user cho phép nhiều chủ đề.
    - KHÔNG "THAY TỪ GIỮ XƯƠNG": Tuyệt đối không chỉ thay từ vựng (synonyms) mà giữ nguyên cấu trúc câu cũ. Phải viết lại câu mới hoàn toàn với ngữ cảnh mới.
    - ĐA DẠNG HÓA KIẾN THỨC: Tránh lặp lại chính xác các điểm kiểm tra (test points) của đề mẫu. Mục tiêu là kiểm tra năng lực ngôn ngữ rộng hơn, không phải kiểm tra lại đúng những gì đề mẫu đã hỏi.
    - KHÔNG LẶP LẠI KIẾN THỨC (NO REPETITION): 
      + Trong cùng một đề thi mới, KHÔNG ĐƯỢC kiểm tra cùng một điểm ngữ pháp hoặc từ vựng quá 1 lần (trừ khi format đề bắt buộc, ví dụ bài đọc hiểu).
      + Ví dụ: Nếu câu 1 đã kiểm tra "Conditional Type 1", thì các câu còn lại KHÔNG ĐƯỢC kiểm tra lại "Conditional Type 1" nữa. Phải chuyển sang các điểm ngữ pháp khác.

    --------------------------------------------------------
    2. QUY TẮC "READING COMPREHENSION" - SIÊU TINH TẾ (SUBTLE DISTRACTORS):
    *** QUAN TRỌNG: TEST-WISENESS PREVENTION (CHỐNG MẸO LÀM BÀI) ***
    
    A. "CLEAN DISTRACTOR" POLICY (CHÍNH SÁCH ĐÁP ÁN SẠCH):
    TUYỆT ĐỐI KHÔNG DÙNG các nhóm từ sau trong đáp án gây nhiễu (Distractors) để tránh việc học sinh dùng mẹo loại trừ:
       1. TỪ TUYỆT ĐỐI (Absolutes): always, never, all, every, none, only, must, entirely, totally.
       2. TỪ CHỈ TẦN SUẤT (Frequency Adverbs): usually, often, sometimes, rarely, seldom, frequently, occasionally.
       3. TỪ CHỈ MỨC ĐỘ (Degree Adverbs): very, extremely, slightly, quite, rather, somewhat, highly.
       4. TỪ SO SÁNH & CỰC CẤP (Comparatives/Superlatives): more, less, most, least, best, worst, better, worse, higher, lower, greater, greatest.

    LÝ DO: Các từ này thường là "red flags" (cờ đỏ) cho đáp án sai. Hãy dùng câu trần thuật đơn giản (simple declarative sentences) sai về SỰ KIỆN (FACTS).

    B. CÁCH TẠO "FACT-BASED TRAPS" (BẪY DỰA TRÊN SỰ KIỆN):
       Đáp án sai phải "SOUNDS RIGHT" (nghe xuôi tai) nhưng "FACTUALLY WRONG" (sai sự thật).

       1. "THE WRONG ENTITY" (Sai đối tượng):
          - Text: "Scientists discovered a new planet."
          - Distractor: "Astronauts discovered a new planet." (Thay Subject).
       
       2. "THE WRONG ATTRIBUTE" (Sai đặc tính):
          - Text: "The red car is eco-friendly."
          - Distractor: "The blue car is eco-friendly." (Thay tính từ chỉ màu/loại, KHÔNG dùng so sánh 'faster' hay 'better').

       3. "THE HALF-RIGHT TRAP" (Bẫy Nửa Đúng):
          - Cấu trúc: [Ý chính đúng] + [Chi tiết nhỏ sai].
          - Text: "Dr. Smith published the paper in London in 1999."
          - Distractor: "Dr. Smith published the paper in Paris in 1999." (Sai địa điểm).

       4. "FALSE CAUSALITY" (Gán ghép nhân quả sai):
          - Text: "It rained, so the game was canceled."
          - Distractor: "The game was canceled, so it rained." (Đảo ngược nhân quả).
        
       5. "WORD MATCHING" (Bẫy từ vựng):
          - Dùng từ ngữ trong bài nhưng ghép vào ngữ cảnh sai hoàn toàn.

    --------------------------------------------------------
    3. QUY TẮC "LISTENING" (SKELETON ONLY):
    - BƯỚC 1: QUÊN HẾT nội dung bài nghe cũ.
    - BƯỚC 2: Viết 1 Transcript MỚI 100% theo chủ đề User.
    - BƯỚC 3: Nhìn vào đề mẫu để copy ĐÚNG LOẠI CÂU HỎI (MCQ, Gap fill...) và ĐÚNG SỐ LƯỢNG CÂU.
    - BƯỚC 4: Tạo câu hỏi mới khớp với Transcript mới.

    --------------------------------------------------------
    CẤU TRÚC ĐẦU RA (MARKDOWN):
    PHẦN 1: ĐỀ THI (Giữ nguyên định dạng, số thứ tự câu)
    PHẦN 2: TRANSCRIPT (Bắt buộc nếu đề mẫu có Listening)
    PHẦN 3: ĐÁP ÁN CHI TIẾT
    PHẦN 4: GIẢI THÍCH (Analysis)
       - Giải thích: "Câu 1 (Mới) kiểm tra 'Conditionals' thay vì 'Passive Voice' như đề mẫu. Distractor B sai vì..."
  `;

  const prompt = `
    INPUT DATA:
    1. MẪU CẤU TRÚC (SAMPLE):
    ---
    ${config.sampleText}
    ---

    ${hasSourceText ? `
    2. SOURCE TEXT (Dùng bài này để ra câu hỏi Reading/Cloze):
    ---
    ${config.sourceText}
    ---
    ` : `
    2. USER REQUIREMENTS:
    - Topics: ${config.topics || "General English"}
    - Vocabulary: ${config.vocabulary || "B2/C1 Level"}
    - Grammar: ${config.grammar || "Standard grammar points"}
    `}

    ${config.readingDistractorGuide ? `
    3. SPECIAL INSTRUCTIONS FOR READING DISTRACTORS (QUAN TRỌNG):
    User yêu cầu cụ thể về cách viết phương án nhiễu (Distractors):
    ---
    ${config.readingDistractorGuide}
    ---
    HÃY TUÂN THỦ NGHIÊM NGẶT CÁC HƯỚNG DẪN TRÊN KHI VIẾT CÂU HỎI ĐỌC HIỂU.
    ` : ''}
    
    EXECUTION ORDER:
    1. Analyze Sample Structure (Format, Question Types).
    2. Identify Sample Test Points (e.g., "Q1 tests Past Simple").
    3. Select NEW Test Points (e.g., "New Q1 will test Present Perfect").
    4. Write NEW Content based on new test points.
    5. Create Questions with CLEAN DISTRACTORS:
       - SCAN ALL OPTIONS: Do they contain 'more', 'less', 'most', 'best', 'always'? -> DELETE AND REWRITE.
       - Focus on WRONG FACTS, NOT COMPARISONS.
    
    GENERATE NOW.
  `;

  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', 
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          thinkingConfig: { thinkingBudget: 4096 },
        },
      });

      return response.text || "Không thể tạo đề thi. Vui lòng thử lại.";
    } catch (error: any) {
      console.error(`Gemini API Error (Attempt ${attempt + 1}):`, error);

      // Check for 429 (Resource Exhausted) or 503 (Service Unavailable)
      const isRetryable = 
        error?.status === 429 || 
        error?.status === 503 || 
        error?.message?.includes('429') ||
        error?.toString().includes('429');

      if (isRetryable && attempt < MAX_RETRIES - 1) {
        // Exponential backoff: 2s, 4s, 8s
        const delayMs = Math.pow(2, attempt) * 2000; 
        console.log(`Rate limited. Retrying in ${delayMs}ms...`);
        await wait(delayMs);
        attempt++;
        continue;
      }
      
      if (error?.status === 429 || error?.message?.includes('429')) {
         throw new Error("Hệ thống đang quá tải (Quota Exceeded). Vui lòng thử lại sau ít phút.");
      }
      throw error;
    }
  }

  throw new Error("Không thể kết nối đến AI sau nhiều lần thử.");
};