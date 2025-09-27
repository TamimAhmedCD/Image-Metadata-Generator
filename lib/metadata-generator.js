import { PROVIDERS } from "@/components/api-management";
import { ADOBE_STOCK_GUIDELINES } from "./adobe-stock-guidelines";

// Base prompt instructions
const BASE_PROMPT_INSTRUCTIONS =
  "Analyze this image and return ONLY a JSON object. The response must be valid, clean JSON.";

function getAiPrompt(type) {
  const stockGuidelines = `
IMPORTANT: Follow Adobe Stock guidelines strictly:

TITLE REQUIREMENTS:
- Maximum 70 characters
- Descriptive and precise phrases (not sentences)
- NO colons, semicolons, or dashes
- NO brand names, artist names, or fictional characters
- Use caring, respectful language for people
- Example: "Young woman playing catch with Jack Russell Terrier at beach"

KEYWORD REQUIREMENTS:
- Exactly 30-49 keywords
- Order by importance (most important first)
- Separate descriptive elements: "white", "fluffy", "young", "animal" as separate keywords
- Include: subject, actions, setting, lighting, viewpoint, demographics, emotions, concepts
- Add location if visible (country, city, state)
- Specify number of people or "nobody"
- Include setting details: "indoors"/"outdoors", "day"/"night", weather
- Add viewpoint: "close-up", "aerial view", "high angle", etc.
- NO dashes in keywords
- NO brand names or third-party IP
- Use respectful demographic terms
`;

  let instructions = "";
  if (type === "full") {
    instructions =
      "- A very descriptive prompt for AI image generation, using key: 'prompt'\n" +
      "- A stock photography title following Adobe Stock guidelines, using key: 'title'\n" +
      "- Exactly 30-49 Adobe Stock compliant keywords (comma separated), using key: 'keywords'";
  } else if (type === "prompt_only") {
    instructions =
      "- A very descriptive prompt for AI image generation, using key: 'prompt'\n" +
      "- Set 'title' and 'keywords' to empty strings";
  } else if (type === "metadata_only") {
    instructions =
      "- A stock photography title following Adobe Stock guidelines, using key: 'title'\n" +
      "- Exactly 30-49 Adobe Stock compliant keywords (comma separated), using key: 'keywords'\n" +
      "- Set 'prompt' to empty string";
  }

  return `${BASE_PROMPT_INSTRUCTIONS}

${stockGuidelines}

Based on your analysis, generate: ${instructions}

Return valid JSON with keys: prompt, title, keywords`;
}

export function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

function parseModelOutput(output) {
  let parsed = {};
  try {
    const cleanOutput = output.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(cleanOutput);
  } catch (err) {
    console.warn(
      "Model output was not valid JSON. Using raw text as prompt.",
      output
    );
    parsed = {
      prompt: output,
      title: "Untitled JSON Parse Failed",
      keywords: "error",
    };
  }

  const result = {
    prompt: parsed.prompt || "",
    title: parsed.title || "",
    keywords: parsed.keywords || "",
  };

  if (result.title) {
    // Remove forbidden characters
    result.title = result.title
      .replace(/[:\-;]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Truncate to 70 characters
    if (result.title.length > ADOBE_STOCK_GUIDELINES.title.maxLength) {
      result.title = result.title
        .substring(0, ADOBE_STOCK_GUIDELINES.title.maxLength)
        .trim();
    }
  }

  if (result.keywords && result.keywords !== "error") {
    // Clean keywords: remove dashes, normalize spacing
    let keywords = result.keywords
      .split(",")
      .map((k) => k.trim().replace(/-/g, " ").replace(/\s+/g, " "))
      .filter((k) => k.length > 0);

    // Ensure keyword count is within Adobe Stock range (30-49)
    const targetCount = Math.max(
      ADOBE_STOCK_GUIDELINES.keywords.minCount,
      Math.min(keywords.length, ADOBE_STOCK_GUIDELINES.keywords.maxCount)
    );

    if (keywords.length < ADOBE_STOCK_GUIDELINES.keywords.minCount) {
      // Add stock photography keywords to reach minimum
      const additionalKeywords = [
        "stock photo",
        "commercial use",
        "professional",
        "high quality",
        "digital image",
        "photography",
        "visual content",
        "marketing",
        "business",
        "lifestyle",
        "concept",
        "modern",
        "contemporary",
      ];

      while (keywords.length < targetCount && additionalKeywords.length > 0) {
        const keyword = additionalKeywords.shift();
        if (keyword && !keywords.includes(keyword)) {
          keywords.push(keyword);
        }
      }
    } else if (keywords.length > ADOBE_STOCK_GUIDELINES.keywords.maxCount) {
      // Trim to maximum allowed
      keywords = keywords.slice(0, ADOBE_STOCK_GUIDELINES.keywords.maxCount);
    }

    result.keywords = keywords.join(", ");
  }

  return result;
}

export async function generateMetadata(imageInfo, apiKey, model, outputType) {
  const { file, base64, mimeType } = imageInfo;
  const provider = PROVIDERS[apiKey.provider];

  let apiUrl = "";
  const headers = { "Content-Type": "application/json" };
  let payload = {};
  const base64Data = base64.split(",")[1];
  const promptText = getAiPrompt(outputType);

  if (apiKey.provider === "gemini") {
    apiUrl = `${provider.baseUrl}${model}:generateContent?key=${apiKey.key}`;
    payload = {
      contents: [
        {
          parts: [
            { text: promptText },
            { inlineData: { mimeType, data: base64Data } },
          ],
        },
      ],
    };
  } else if (apiKey.provider === "openrouter") {
    apiUrl = provider.baseUrl;
    headers["Authorization"] = `Bearer ${apiKey.key}`;
    headers["HTTP-Referer"] = "image-metadata-app";

    payload = {
      model: model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: promptText },
            { type: "image_url", image_url: { url: base64 } },
          ],
        },
      ],
    };
  } else if (apiKey.provider === "openai") {
    apiUrl = provider.baseUrl;
    headers["Authorization"] = `Bearer ${apiKey.key}`;

    payload = {
      model: model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: promptText },
            { type: "image_url", image_url: { url: base64 } },
          ],
        },
      ],
    };
  } else if (apiKey.provider === "anthropic") {
    apiUrl = provider.baseUrl;
    headers["Authorization"] = `Bearer ${apiKey.key}`;
    headers["anthropic-version"] = "2023-06-01";

    payload = {
      model: model,
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: promptText },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
    };
  } else {
    throw new Error("Invalid API provider selected.");
  }

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      `API call failed: ${res.status} (${res.statusText}). Details: ${
        errorData.error?.message || errorData.message || "Unknown error"
      }`
    );
  }

  const data = await res.json();

  let output = "";
  if (apiKey.provider === "gemini") {
    output = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } else if (apiKey.provider === "anthropic") {
    output = data?.content?.[0]?.text || "";
  } else {
    output = data?.choices?.[0]?.message?.content || "";
  }

  return parseModelOutput(output);
}
