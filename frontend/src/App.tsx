import React, { useState } from "react";
import { uploadPDF, askQuestion, UploadPDFResponse, AskQuestionResponse } from "./api";

/**
 * 主应用组件
 * - 支持PDF上传、问题输入、展示回答
 */
const App: React.FC = () => {
  // PDF文本内容
  const [pdfText, setPdfText] = useState<string>("");
  // 用户输入的问题
  const [question, setQuestion] = useState<string>("");
  // OpenAI返回的答案
  const [answer, setAnswer] = useState<string>("");
  // 错误信息
  const [error, setError] = useState<string>("");
  // 加载状态
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * 处理PDF文件上传
   */
  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setPdfText("");
    setAnswer("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("只支持PDF文件");
      return;
    }
    setLoading(true);
    try {
      const res: UploadPDFResponse = await uploadPDF(file);
      setPdfText(res.pdf_text);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理提问
   */
  const handleAsk = async () => {
    setError("");
    setAnswer("");
    if (!pdfText) {
      setError("请先上传PDF文件");
      return;
    }
    if (!question.trim()) {
      setError("请输入问题");
      return;
    }
    setLoading(true);
    try {
      const res: AskQuestionResponse = await askQuestion(question, pdfText);
      setAnswer(res.answer);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24, border: "1px solid #eee", borderRadius: 8, background: "#fafcff" }}>
      <h2>PDF 问答系统</h2>
      <div style={{ marginBottom: 16 }}>
        <input type="file" accept="application/pdf" onChange={handlePDFUpload} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <textarea
          placeholder="请输入你的问题..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          rows={3}
          style={{ width: "100%", resize: "vertical" }}
        />
      </div>
      <button onClick={handleAsk} disabled={loading || !pdfText} style={{ padding: "8px 24px" }}>
        {loading ? "处理中..." : "提问"}
      </button>
      {error && <div style={{ color: "#c00", marginTop: 16 }}>{error}</div>}
      {answer && (
        <div style={{ marginTop: 24, padding: 16, background: "#f6f8fa", borderRadius: 6 }}>
          <strong>回答：</strong>
          <div>{answer}</div>
        </div>
      )}
    </div>
  );
};

export default App;
