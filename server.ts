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

  // API Route: Accommodation & Hotel Search Grounding Lookup
  app.post("/api/lookup-hotels", async (req, res) => {
    try {
      const { venue, cityCountry } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set on the server." });
      }
      if (!venue || !venue.trim()) {
        return res.status(400).json({ error: "Venue is required for accommodation search." });
      }

      // Dynamic import
      const { GoogleGenAI, Type } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' }
        }
      });

      const prompt = `Perform a live search to find exactly 3 real, active commercial hotels/accommodations located closest to the event venue: "${venue}" in "${cityCountry}".
      Pick high-quality hotels suitable for corporate event travelers. Provide their exact public name, estimated business-tier cost per night, approximate distance from the venue, description, and physical address.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }],
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hotels: {
                type: Type.ARRAY,
                description: "List of real hotels found near the venue",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Official name of the property" },
                    address: { type: Type.STRING, description: "Complete physical address" },
                    distance: { type: Type.STRING, description: "Detailed proximity or distance from the venue (e.g. 0.3 miles, 12 minutes walk)" },
                    pricePerNight: { type: Type.STRING, description: "Estimated corporate rate per night in USD or local currency" },
                    description: { type: Type.STRING, description: "A sentence highlighting premium business traveler comforts" }
                  },
                  required: ["name", "address", "distance", "pricePerNight", "description"]
                }
              }
            },
            required: ["hotels"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      res.json({ success: true, hotels: result.hotels || [] });
    } catch (err: any) {
      console.warn("[agents] Hotel lookup search failed, falling back to local list: ", err);
      const venueNorm = (req.body.venue || "").toLowerCase();
      const cityNorm = (req.body.cityCountry || "").toLowerCase();

      let fallbackHotels = [
        {
          name: "Crowne Plaza London - Docklands",
          address: "Western Gateway, Royal Victoria Dock, London E16 1AL, United Kingdom",
          distance: "0.2 miles from ExCeL London",
          pricePerNight: "$240 USD",
          description: "Premium lakeview hotel with on-site high-speed business hubs and full conference catering."
        },
        {
          name: "Radisson Blu Hotel, Nairobi Upper Hill",
          address: "Elgon Road, Upper Hill, Nairobi, Kenya",
          distance: "0.9 miles from CBD Center",
          pricePerNight: "KES 18,500 Ksh",
          description: "Upscale corporate base featuring robust fast Wi-Fi, executive business lounge access, and scenic terraces."
        },
        {
          name: "Crowne Plaza Geneva",
          address: "Avenue de Louis-Casaï 75, 1216 Cointrin, Geneva, Switzerland",
          distance: "0.4 miles from Geneva International Airport & Palexpo",
          pricePerNight: "CHF 210",
          description: "A top business destination with airport transit connections and formal modular meeting lounges."
        }
      ];

      // Filter based on city
      if (cityNorm.includes("nairobi") || venueNorm.includes("nairobi")) {
        fallbackHotels = [fallbackHotels[1]];
      } else if (cityNorm.includes("london") || venueNorm.includes("excel") || venueNorm.includes("london")) {
        fallbackHotels = [fallbackHotels[0]];
      } else if (cityNorm.includes("geneva") || venueNorm.includes("palexpo") || cityNorm.includes("switzerland")) {
        fallbackHotels = [fallbackHotels[2]];
      }

      res.json({ success: true, hotels: fallbackHotels, fallbackUsed: true });
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
