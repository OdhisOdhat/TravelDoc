import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { executePipeline } from "./src/server/agents";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsers
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Route: Multi-Agent Travel Documentation Pipeline Execution
  app.post("/api/generate", async (req, res) => {
    try {
      const { candidates, company, event, theme } = req.body;

      if (!candidates || !candidates.length) {
        return res.status(400).json({ error: "Candidate list is required and cannot be empty." });
      }
      if (!company) {
        return res.status(400).json({ error: "Corporate profile is required." });
      }
      if (!event) {
        return res.status(400).json({ error: "Event details are required." });
      }

      console.log(`[agents] Executing document generation pipeline for ${candidates.length} candidate(s)...`);
      const packages = await executePipeline(candidates, company, event, theme || "Swiss Modern");
      console.log(`[agents] Generation complete for ${packages.length} package(s).`);

      res.json({ success: true, packages });
    } catch (err: any) {
      console.error("[agents] Pipeline execution failed: ", err);
      res.status(500).json({
        error: "An error occurred during multi-agent orchestration.",
        details: err.message || err
      });
    }
  });

  // API Route: Interactive Regenerator
  app.post("/api/regenerate-document", async (req, res) => {
    try {
      const { candidate, company, event, documentType, currentContent, feedback, branding } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set on the server." });
      }

      // Dynamic import
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' }
        }
      });

      const prompt = `You are a professional documentation specialist.
      We have an existing "${documentType}" drafted for traveler "${candidate.fullName}".
      We need to adjust or rewrite it based on user feedback: "${feedback}".
      
      Here is the current content:
      ---
      ${currentContent}
      ---
      
      Details:
      - Traveler Name: ${candidate.fullName}
      - Traveler Passport: ${candidate.passportNumber}
      - Company Name: ${company.name}
      - Signatory Executive: ${company.signatoryName}
      - Event Name: ${event.name}
      
      Please regenerate the document content using professional markdown formatting. Update only the sections required or rewrite perfectly according to instructions. Provide only the updated text back without any extra tags.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });

      res.json({ success: true, updatedContent: response.text || currentContent });
    } catch (err: any) {
      console.error("[agents] Regeneration failed: ", err);
      res.status(500).json({ error: "Failed to regenerate document.", details: err.message || err });
    }
  });

  // API Route: AI Event/Venue Lookup and Auto-fill
  app.post("/api/lookup-venue", async (req, res) => {
    try {
      const { eventName } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set on the server." });
      }
      if (!eventName || !eventName.trim()) {
        return res.status(400).json({ error: "Event name is required." });
      }

      // Dynamic import
      const { GoogleGenAI, Type } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' }
        }
      });

      const prompt = `Lookup or realistically autogenerate professional host, venue address, city, country, standard duration, and purpose details for an international conference/event: "${eventName}".
      If the conference name refers to a well-known real summit, provide its real typical venue, host, and country (for example, COP meetings, tech forums, or regional summits).
      Provide logical, realistic fallback parameters if the event is fictitious (ideally within high-importance hubs like Nairobi, London, Geneva, San Francisco).
      Ensure the start date and end date are formatted as YYYY-MM-DD (assume future dates around September/October 2026).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hostOrg: { type: Type.STRING, description: "Official hosting executive organization/corporation" },
              venue: { type: Type.STRING, description: "A realistic premium convention centre or hotel hall address" },
              cityCountry: { type: Type.STRING, description: "City and Country name (e.g. Nairobi, Kenya or Geneva, Switzerland)" },
              startDate: { type: Type.STRING, description: "Start date in format YYYY-MM-DD" },
              endDate: { type: Type.STRING, description: "End date in format YYYY-MM-DD" },
              purpose: { type: Type.STRING, description: "Comprehensive, highly formal professional paragraph explaining the scientific / business reasons why the nominee MUST attend." }
            },
            required: ["hostOrg", "venue", "cityCountry", "startDate", "endDate", "purpose"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      res.json({ success: true, eventDetails: result });
    } catch (err: any) {
      console.error("[agents] Venue lookup failed: ", err);
      res.status(500).json({ error: "Failed to lookup event and venue coordinates.", details: err.message || err });
    }
  });

  // Vite Middleware Setup
  if (process.env.NODE_ENV !== "production") {
    console.log("[server] Booting in Development (Vite Middleware) Mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[server] Booting in Production Mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`👉 Preview URL: http://localhost:${PORT}`);
    console.log(`======================================================\n`);
  });
}

startServer();
