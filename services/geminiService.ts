
import { GoogleGenAI } from "@google/genai";

// وظيفة مساعدة لتهيئة الـ AI بشكل آمن
// CRITICAL: Must use process.env.API_KEY directly as per guidelines.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStudyPlan = async (studentName: string, currentLevel: string, target: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `بصفتك خبير في تعليم القرآن الكريم، قم بوضع خطة دراسية أسبوعية للطالب ${studentName}، مستواه الحالي هو ${currentLevel} وهدفه هو ${target}. اجعل الخطة مفصلة تشمل الحفظ والمراجعة والقاعدة النورانية إن لزم الأمر. أجب بتنسيق Markdown احترافي بالعربية.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Plan Error:", error);
    return "حدث خطأ أثناء التواصل مع خادم الذكاء الاصطناعي.";
  }
};

export const evaluateStudentPerformance = async (studentName: string, performanceNote: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `بصفتك مشرف تربوي في مركز قرآني، حلل ملاحظة المعلم التالية عن الطالب "${studentName}": "${performanceNote}". 
      قدم تقريراً تربوياً يشمل:
      1. تحليل نقاط القوة.
      2. 3 نصائح عملية للتحسين (خاصة في التجويد أو الحفظ).
      3. عبارة تحفيزية قوية.
      أجب بتنسيق Markdown مختصر وجذاب بالعربية.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Evaluation Error:", error);
    return "فشل التقييم الذكي.";
  }
};

export const getShariaResources = async (subject: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `اقترح أفضل 3 كتب أو مراجع للمبتدئين في علم "${subject}" لتكون ضمن مكتبة مركز شرعي. اذكر اسم الكتاب، المؤلف، ولماذا يُنصح به باختصار شديد.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Resources Error:", error);
    return null;
  }
};

export const generateShariaQuiz = async (subject: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `قم بتوليد اختبار قصير مكون من 5 أسئلة اختيار من متعدد لمادة "${subject}". 
      يجب أن تكون الأسئلة تعليمية ومناسبة لطلاب المراكز الشرعية.
      أجب بتنسيق نصي بسيط (السؤال، ثم الخيارات، ثم الإجابة الصحيحة). 
      اجعل الرد باللغة العربية الفصحى.`,
    });
    return response.text;
  } catch (error) {
    console.error("Quiz Gen Error:", error);
    return null;
  }
};
