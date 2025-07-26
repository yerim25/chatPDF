export interface UploadPDFResponse {
  pdf_text: string;
}

export interface AskQuestionResponse {
  answer: string;
}

export async function uploadPDF(file: File): Promise<UploadPDFResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("https://chatpdf-vng9.onrender.com/upload_pdf/", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error("PDF上传失败: " + (await response.text()));
  }
  return response.json() as Promise<UploadPDFResponse>;
}

export async function askQuestion(question: string, pdfText: string): Promise<AskQuestionResponse> {
  const response = await fetch("https://chatpdf-vng9.onrender.com/ask_question/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, pdf_text: pdfText }),
  });
  if (!response.ok) {
    throw new Error("提问失败: " + (await response.text()));
  }
  return response.json() as Promise<AskQuestionResponse>;
} 