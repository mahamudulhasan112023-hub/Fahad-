// server.ts
import express from "express";
import http from "http";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
var app = express();
var server = http.createServer(app);
var PORT = process.env.PORT || 3e3;
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
var ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
app.post("/api/gemini/solve-text", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "\u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE\u099F\u09BF \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u09B2\u09BF\u0996\u09C7 \u099C\u09BE\u09A8\u09BE\u09A8\u0964" });
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are NEXUS AI, a brilliant, polite problem-solver assistant. CRITICAL: You must always start every response with the Islamic greeting '\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE' (Assalamu Alaikum) first! Never say '\u09A8\u09AE\u09B8\u09CD\u0995\u09BE\u09B0' or other greetings. After the greeting, write the detailed step-by-step solution or explanation in clear, beautifully formatted Bengali (\u09AC\u09BE\u0982\u09B2\u09BE) language with emojis."
      }
    });
    console.log("Gemini text response:", response.text);
    res.json({ result: response.text });
  } catch (error) {
    console.error("Gemini text error:", error);
    res.status(500).json({ error: "\u09A6\u09C1\u0983\u0996\u09BF\u09A4, \u098F\u0986\u0987 \u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0\u09C7 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u09A6\u09DF\u09BE \u0995\u09B0\u09C7 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" });
  }
});
app.post("/api/gemini/solve-image", async (req, res) => {
  try {
    const { base64Image, mimeType, prompt } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: "\u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u098F\u0995\u099F\u09BF \u099B\u09AC\u09BF \u09AF\u09C1\u0995\u09CD\u09A4 \u0995\u09B0\u09C1\u09A8\u0964" });
    }
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
          { text: prompt || "\u098F\u0987 \u099B\u09AC\u09BF\u09A4\u09C7 \u0995\u09C0 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B0\u09DF\u09C7\u099B\u09C7 \u098F\u09AC\u0982 \u098F\u09B0 \u09B8\u09AE\u09BE\u09A7\u09BE\u09A8 \u0995\u09C0?" },
          imagePart
        ]
      },
      config: {
        systemInstruction: "You are NEXUS Vision AI, an expert visual problem-solver. Analyze the provided image thoroughly. CRITICAL: You must always start every response with the Islamic greeting '\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE' (Assalamu Alaikum) first! Never say '\u09A8\u09AE\u09B8\u09CD\u0995\u09BE\u09B0' or other greetings. Describe any visible issues or details, and write a helpful step-by-step resolution guide in beautiful, concise Bengali (\u09AC\u09BE\u0982\u09B2\u09BE) language with emojis."
      }
    });
    res.json({ result: response.text });
  } catch (error) {
    console.error("Gemini image error:", error);
    res.status(500).json({ error: "\u09A6\u09C1\u0983\u0996\u09BF\u09A4, \u099B\u09AC\u09BF\u099F\u09BF \u09AC\u09BF\u09B6\u09CD\u09B2\u09C7\u09B7\u09A3 \u0995\u09B0\u09A4\u09C7 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u09A6\u09DF\u09BE \u0995\u09B0\u09C7 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" });
  }
});
app.post("/api/gemini/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "\u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u099B\u09AC\u09BF\u09B0 \u09AC\u09BF\u09AC\u09B0\u09A3 (prompt) \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8\u0964" });
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
      return res.status(500).json({ error: "\u099B\u09AC\u09BF \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" });
    }
    res.json({ imageUrl: foundBase64 });
  } catch (error) {
    console.error("Gemini image generate error:", error);
    res.status(500).json({ error: "\u09A6\u09C1\u0983\u0996\u09BF\u09A4, \u098F\u0986\u0987 \u099B\u09AC\u09BF \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5 \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u09A6\u09DF\u09BE \u0995\u09B0\u09C7 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" });
  }
});
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
      const html = await vite.transformIndexHtml(url, await import("fs").then((m) => m.promises.readFile(htmlFile, "utf-8")));
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
} else {
  app.use(express.static(path.resolve("./dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve("./dist/index.html"));
  });
}
server.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || "development"} mode on http://localhost:${PORT}`);
});
