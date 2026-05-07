export const config = {
  api: {
    bodyParser: { sizeLimit: '10mb' },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pdfBase64, plant } = req.body;
  if (!pdfBase64 || !plant) {
    return res.status(400).json({ error: 'Missing pdfBase64 or plant' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  const prompt = `You are extracting metrics from an Ahmed Group of Industries daily Operational Reporting Pack PDF (Pakistan edible oil/ghee/soap manufacturer).

Plant: ${plant}

Extract all available metrics and return ONLY valid JSON, no preamble, no markdown fences. Use null for any value not found in the PDF. Convert units as needed (kg to MT, etc.).

Return this EXACT structure:
{
  "reportDate": "YYYY-MM-DD",
  "production": {
    "cr_chemical_oil_actual": null,
    "cr_physical_ghee_actual": null,
    "cr_physical_oil_actual": null,
    "br_hydrogenation_actual": null,
    "br_blending_actual": null,
    "br_final_deo_ghee_actual": null,
    "br_final_deo_oil_actual": null,
    "cr_chemical_oil_mtd": null,
    "cr_physical_ghee_mtd": null,
    "cr_physical_oil_mtd": null,
    "br_hydrogenation_mtd": null,
    "br_blending_mtd": null,
    "br_final_deo_ghee_mtd": null,
    "cr_physical_ghee_downtime": null,
    "cr_chemical_oil_downtime": null
  },
  "filling": {
    "ryk_oil": null, "ryk_ghee": null,
    "skr_oil": null, "skr_ghee": null,
    "shahbaz_ghee": null, "shahbaz_oil": null,
    "gharana_ghee": null, "gharana_oil": null,
    "rite_ghee": null, "rite_oil": null
  },
  "soap": {
    "total_actual_mt": null,
    "total_mtd_mt": null,
    "forecast_mtd": null,
    "compliance_pct": null
  },
  "mustard": {
    "total_kg": null,
    "ml_125": null, "ml_250": null, "ml_500": null, "ml_1000": null,
    "mtd_kg": null, "dispatch_kg": null
  },
  "utilities": {
    "wapda_peak_kwh": null,
    "wapda_offpeak_kwh": null,
    "solar_kwh": null,
    "generator_kwh": null,
    "boiler_gas_ft3": null,
    "cr_gas_ft3": null,
    "hydrogen_gas_ft3": null,
    "remaining_factory_gas_ft3": null,
    "br_steam_mt": null,
    "cr_steam_mt": null,
    "soap_steam_mt": null,
    "gas_plant_steam_mt": null,
    "ro_water_mt": null,
    "diesel_total_l": null,
    "hydrogen_lb": null,
    "furnace_oil_l": null
  },
  "stock": {
    "fg_ghee_mt": null,
    "fg_oil_mt": null,
    "packable_ghee_mt": null,
    "packable_oil_mt": null,
    "hard_blended_ghee_mt": null,
    "hard_ghee_mt": null,
    "mustard_packable_mt": null,
    "ost_total_mt": null,
    "ost_olein_mt": null,
    "ost_rbd_mt": null,
    "ost_canola_mt": null,
    "ost_soybean_mt": null,
    "ost_cottonseed_mt": null
  },
  "dispatch": {
    "total_mt": null,
    "vehicles": null,
    "ghee_mt": null,
    "oil_mt": null,
    "rso_mt": null
  }
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'application/pdf',
                  data: pdfBase64,
                },
              },
            ],
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4000,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini error:', data);
      return res.status(500).json({ error: 'API call failed', detail: data });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(500).json({ error: 'No content in response' });
    }

    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Extraction error:', err);
    return res.status(500).json({ error: err.message });
  }
}
