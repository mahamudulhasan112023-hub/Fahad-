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
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});

// API endpoint for Text-based AI Problem Solver
app.post("/api/gemini/solve-text", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "অনুগ্রহ করে আপনার সমস্যাটি বিস্তারিত লিখে জানান।" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are NEXUS AI, a brilliant, polite problem-solver assistant. CRITICAL: You must always start every response with the Islamic greeting 'আসসালামু আলাইকুম' (Assalamu Alaikum) first! Never say 'নমস্কার' or other greetings. After the greeting, write the detailed step-by-step solution or explanation in clear, beautifully formatted Bengali (বাংলা) language with emojis."
      }
    });

    console.log("Gemini text response:", response.text);

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Gemini text error:", error);
    res.status(500).json({ error: "দুঃখিত, এআই সার্ভারে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।" });
  }
});

// API endpoint for Vision-based Image Problem Solver
app.post("/api/gemini/solve-image", async (req, res) => {
  try {
    const { base64Image, mimeType, prompt } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: "অনুগ্রহ করে একটি ছবি যুক্ত করুন।" });
    }

    // Clean base64 data to get just the raw payload
    let cleanBase64 = base64Image;
    if (base64Image.includes(",")) {
      cleanBase64 = base64Image.split(",")[1];
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/png",
        data: cleanBase64
      }
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: {
        parts: [
          { text: prompt || "এই ছবিতে কী সমস্যা রয়েছে এবং এর সমাধান কী?" },
          imagePart
        ]
      },
      config: {
        systemInstruction: "You are NEXUS Vision AI, an expert visual problem-solver. Analyze the provided image thoroughly. CRITICAL: You must always start every response with the Islamic greeting 'আসসালামু আলাইকুম' (Assalamu Alaikum) first! Never say 'নমস্কার' or other greetings. Describe any visible issues or details, and write a helpful step-by-step resolution guide in beautiful, concise Bengali (বাংলা) language with emojis."
      }
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Gemini image error:", error);
    res.status(500).json({ error: "দুঃখিত, ছবিটি বিশ্লেষণ করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।" });
  }
});

// API endpoint for AI Image Generation
app.post("/api/gemini/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "অনুগ্রহ করে ছবির বিবরণ (prompt) প্রদান করুন।" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    let foundBase64 = null;
    const candidates = response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData?.data) {
          foundBase64 = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!foundBase64) {
      return res.status(500).json({ error: "ছবি তৈরি করা যায়নি। আবার চেষ্টা করুন।" });
    }

    res.json({ imageUrl: foundBase64 });
  } catch (error: any) {
    console.error("Gemini image generate error:", error);
    res.status(500).json({ error: "দুঃখিত, এআই ছবি তৈরি করতে ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।" });
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
