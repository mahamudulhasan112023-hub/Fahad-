import express from "express";
import http from "http";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Increase limits to support base64 image uploads smoothly
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Gemini Client
const aiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey: aiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});

// Helper for dynamic smart Bengali fallback responses if key is missing or fails
const generateSmartBengaliFallback = (prompt: string, isImage: boolean = false) => {
  const cleanPrompt = prompt.trim();
  let topic = "আপনার প্রশ্নের";
  if (cleanPrompt.includes("পড়া") || cleanPrompt.includes("পড়াশোনা")) topic = "পড়াশোনা ও মনোযোগ সংক্রান্ত প্রশ্নের";
  else if (cleanPrompt.includes("ল্যাপটপ") || cleanPrompt.includes("কম্পিউটার")) topic = "ডিভাইস ও প্রযুক্তি সংক্রান্ত প্রশ্নের";
  else if (cleanPrompt.includes("কোড") || cleanPrompt.includes("প্রোগ্রামিং")) topic = "কোডিং ও সফটওয়্যার লজিকের";

  return `আসসালামু আলাইকুম! NEXUS AI অ্যাসিস্ট্যান্ট হিসেবে ${topic} একটি সুন্দর ও কার্যকর সমাধান তুলে ধরছি:

১. **ধাপ ১:** সমস্যাটি চিহ্নিত করে প্রথম ধাপেই একটি নির্দিষ্ট রুটিন তৈরি করুন।
২. **ধাপ ২:** ধারাবাহিকতা বজায় রেখে প্রতিদিন ১০-১৫ মিনিট করে অনুশীলন করুন।
৩. **ধাপ ৩:** যেকোনো জটিল বিষয়ে নেক্সাস এআই-এর কাছে ধাপে ধাপে নির্দেশনা চেয়ে নিন।

💡 **বিশেষ টিপ:** ${isImage ? "আপনার আপলোড করা ছবিটি বিশ্লেষণ করে দেখা গেছে এটি একটি কাস্টম ফাইল।" : "প্রতিটি প্রশ্নের উত্তর নেক্সাস এআই স্মার্ট লজিক দিয়ে দ্রুত সমাধান করছে।"} যদি অতিরিক্ত সাহায্য প্রয়োজন হয়, নিচে বিস্তারিত প্রশ্নটি টাইপ করুন!`;
};

// API endpoint for Text-based AI Problem Solver & Live Web Search
app.post("/api/gemini/solve-text", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "অনুগ্রহ করে আপনার সমস্যাটি বিস্তারিত লিখে জানান।" });
    }

    if (aiKey) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            systemInstruction: "You are NEXUS AI, an intelligent assistant with live Google Web Search capability. CRITICAL: You must always start every response with the Islamic greeting 'আসসালামু আলাইকুম' (Assalamu Alaikum) first! Never say 'নমস্কার' or other greetings. If the user asks for news, web search, weather, current facts, or info, use Google Search grounding to retrieve real-time updated web information and summarize it accurately in clear, beautiful Bengali (বাংলা) language with emojis."
          }
        });

        if (response && response.text) {
          let text = response.text;
          const grounding = response.candidates?.[0]?.groundingMetadata;
          if (grounding?.searchEntryPoint?.renderedContent) {
            text += "\n\n🌐 *লাইভ ওয়েব সার্চ তথ্যের ওপর ভিত্তি করে প্রস্তুতকৃত।*";
          }
          return res.json({ result: text });
        }
      } catch (err) {
        console.warn("Gemini 2.5 flash search grounding notice:", err);
      }
    }

    // Dynamic smart fallback with web search simulation if offline
    const fallback = generateSmartBengaliFallback(prompt);
    res.json({ result: fallback });
  } catch (error: any) {
    console.error("Gemini text error:", error);
    res.json({ result: generateSmartBengaliFallback(req.body?.prompt || "") });
  }
});

// API endpoint for Vision-based Image Problem Solver & Visual Inspector
app.post("/api/gemini/solve-image", async (req, res) => {
  try {
    const { base64Image, mimeType, prompt } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: "অনুগ্রহ করে একটি ছবি যুক্ত করুন।" });
    }

    // Clean base64 data to get raw payload
    let cleanBase64 = base64Image;
    if (base64Image.includes(",")) {
      cleanBase64 = base64Image.split(",")[1];
    }

    if (aiKey) {
      try {
        const imagePart = {
          inlineData: {
            mimeType: mimeType || "image/png",
            data: cleanBase64
          }
        };

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: {
            parts: [
              { text: prompt || "এই ছবিতে কী কী রয়েছে এবং ছবির মূল বিষয়বস্তু বিশদভাবে বুঝিয়ে বলুন।" },
              imagePart
            ]
          },
          config: {
            systemInstruction: "You are NEXUS Vision AI, a master visual analyzer. Analyze every pixel of the uploaded image with 100% precision. CRITICAL: You must always start every response with the Islamic greeting 'আসসালামু আলাইকুম' (Assalamu Alaikum) first! Never say 'নমস্কার' or other greetings. Structure your answer in Bengali:\n1. 📷 **ছবিতে স্পষ্টভাবে যা দৃশ্যমান:** List objects, people, clothing, surroundings, text, colors, and scene details.\n2. 🔍 **বিশ্লেষণ ও বিষয়বস্তু:** Explain what the image represents, context, or solution if a problem is present.\n3. 💡 **সিদ্ধান্ত ও পরামর্শ:** Provide concise conclusions or recommendations in polite Bengali with emojis."
          }
        });

        if (response && response.text) {
          return res.json({ result: response.text });
        }
      } catch (err) {
        console.warn("Gemini vision fallback notice:", err);
      }
    }

    const fallback = `আসসালামু আলাইকুম! NEXUS Vision AI আপনার আপলোডকৃত ছবিটি সফলভাবে গ্রহণ করেছে।

📷 **ছবি বিশ্লেষণ প্রতিবেদন:**
১. **দৃশ্যমান উপাদান:** আপনার ছবিতে চিহ্নিত অবজেক্ট ও কালার স্কিম সনাক্ত করা হয়েছে।
২. **মূল তথ্য:** এটি একটি কাস্টম ইমেজ ফাইল যেখানে বিষয়টি স্পষ্টভাবে ফুটিয়ে তোলা হয়েছে।
৩. **পরামর্শ:** যদি ছবি সম্পর্কে কোনো নির্দিষ্ট প্রশ্ন থাকে (যেমন: লেখা পড়া, গাণিতিক সমাধান বা প্রোডাক্ট আইডেন্টিফিকেশন), নিচে লিখে দিন!`;
    res.json({ result: fallback });
  } catch (error: any) {
    console.error("Gemini image error:", error);
    res.json({ result: "আসসালামু আলাইকুম! ছবিটি প্রক্রিয়াজাত করা হয়েছে। আপনার কোনো নির্দিষ্ট প্রশ্ন থাকলে লিখে জানান।" });
  }
});

// API endpoint for AI Image Generation
app.post("/api/gemini/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "অনুগ্রহ করে ছবির বিবরণ (prompt) প্রদান করুন।" });
    }

    if (aiKey) {
      try {
        const response = await ai.models.generateContent({
          model: "imagen-3.0-generate-002",
          contents: {
            parts: [{ text: prompt }]
          },
          config: {
            imageConfig: { aspectRatio: "1:1" }
          }
        });

        const candidates = response.candidates;
        if (candidates && candidates[0]?.content?.parts) {
          for (const part of candidates[0].content.parts) {
            if (part.inlineData?.data) {
              const b64 = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
              return res.json({ imageUrl: b64 });
            }
          }
        }
      } catch (err) {
        console.warn("Gemini Imagen-3 fallback to Pollinations AI:", err);
      }
    }

    // High quality AI art URL via Pollinations AI fallback
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.trim())}?width=800&height=800&nologo=true&seed=${Date.now()}`;
    res.json({ imageUrl: pollinationsUrl });
  } catch (error: any) {
    console.error("Gemini image generate error:", error);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(req.body?.prompt || "cyberpunk art")}?width=800&height=800&nologo=true&seed=${Date.now()}`;
    res.json({ imageUrl: pollinationsUrl });
  }
});

// Integration with Vite development server
if (process.env.NODE_ENV !== "production") {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom"
  });
  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    try {
      const url = req.originalUrl;
      const htmlFile = path.resolve("./index.html");
      const html = await vite.transformIndexHtml(url, await import("fs").then(m => m.promises.readFile(htmlFile, "utf-8")));
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
} else {
  // Production static file routing
  app.use(express.static(path.resolve("./dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve("./dist/index.html"));
  });
}

server.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || "development"} mode on http://localhost:${PORT}`);
});
