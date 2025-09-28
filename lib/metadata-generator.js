// This file assumes the following constants and helper functions are imported
// from the main API management component file.

import { PROVIDERS } from "@/components/api-management";

// Simplified ADOBE_STOCK_GUIDELINES for standalone testing,
// as the original was imported from a missing file.
// You should ensure the actual ADOBE_STOCK_GUIDELINES object is available in your final project.
const ADOBE_STOCK_GUIDELINES = {
  title: {
    maxLength: 70,
  },
  keywords: {
    minCount: 30,
    maxCount: 49,
  },
};

// Assuming PROVIDERS is imported from api-management.js
// You must ensure this import is correct in your final project.
// Example mock for PROVIDERS:
// const PROVIDERS = { ... your PROVIDERS object ... };

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
    // Fallback for failed JSON parsing
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
    let keywords = [];

    if (typeof result.keywords === "string") {
      // Keywords are a comma-separated string
      keywords = result.keywords
        .split(",")
        .map((k) => k.trim().replace(/-/g, " ").replace(/\s+/g, " "))
        .filter((k) => k.length > 0);
    } else if (Array.isArray(result.keywords)) {
      // Keywords are already an array
      keywords = result.keywords
        .map((k) => String(k).trim().replace(/-/g, " ").replace(/\s+/g, " "))
        .filter((k) => k.length > 0);
    } else {
      // Keywords are some other type, convert to string and split
      console.log(
        `[v0] Unexpected keywords type: ${typeof result.keywords}, value:`,
        result.keywords
      );
      keywords = String(result.keywords)
        .split(",")
        .map((k) => k.trim().replace(/-/g, " ").replace(/\s+/g, " "))
        .filter((k) => k.length > 0);
    }

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

      // Only add keywords if they aren't already present
      let i = 0;
      while (keywords.length < targetCount && i < additionalKeywords.length) {
        const keyword = additionalKeywords[i];
        if (!keywords.includes(keyword)) {
          keywords.push(keyword);
        }
        i++;
      }
    } else if (keywords.length > ADOBE_STOCK_GUIDELINES.keywords.maxCount) {
      // Trim to maximum allowed
      keywords = keywords.slice(0, ADOBE_STOCK_GUIDELINES.keywords.maxCount);
    }

    result.keywords = keywords.join(", ");
  }

  return result;
}

async function fetchWithRetry(url, options, maxRetries = 3) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // If it's a 503 error and we have retries left, wait and retry
      if (response.status === 503 && attempt < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff, max 10s
        console.log(
          `[v0] API returned 503, retrying in ${waitTime}ms (attempt ${attempt}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(
          `[v0] Network error, retrying in ${waitTime}ms (attempt ${attempt}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

export async function generateMetadata(imageInfo, apiKey, model, outputType) {
  // Note: apiKey object is of type ApiKey from api-management.js
  // PROVIDERS object is also imported from api-management.js
  const { file, base64, mimeType } = imageInfo;
  const provider = PROVIDERS[apiKey.provider]; // Access provider using the key string

  let apiUrl = "";
  const headers = { "Content-Type": "application/json" };
  let payload = {};
  // base64 includes the "data:mime/type;base64," prefix. We need the part after the comma.
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
    headers["HTTP-Referer"] = "image-metadata-app"; // Recommended for OpenRouter

    payload = {
      model: model,
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: promptText },
            { type: "image_url", image_url: { url: base64 } }, // OpenRouter/OpenAI use the full base64 URL
          ],
        },
      ],
    };
  } else if (apiKey.provider === "openai") {
    apiUrl = provider.baseUrl;
    headers["Authorization"] = `Bearer ${apiKey.key}`;

    payload = {
      model: model,
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: promptText },
            { type: "image_url", image_url: { url: base64 } }, // OpenAI uses the full base64 URL
          ],
        },
      ],
    };
  } else if (apiKey.provider === "anthropic") {
    apiUrl = provider.baseUrl;
    headers["X-Api-Key"] = apiKey.key; // Anthropic uses X-Api-Key header
    headers["anthropic-version"] = "2023-06-01";

    payload = {
      model: model,
      max_tokens: 2000,
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
            }, // Anthropic uses separate fields
          ],
        },
      ],
    };
  } else {
    throw new Error("Invalid API provider selected.");
  }

  try {
    const res = await fetchWithRetry(apiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errorMessage = "Unknown error";

      try {
        const errorData = await res.json();
        errorMessage =
          errorData.error?.message || errorData.message || `HTTP ${res.status}`;
      } catch {
        // If we can't parse the error response, use status text
        errorMessage = res.statusText || `HTTP ${res.status}`;
      }

      // Centralized error handling
      if (res.status === 503) {
        throw new Error(
          "Service temporarily unavailable. The API service is experiencing high load. Please try again in a few moments."
        );
      } else if (res.status === 429) {
        throw new Error(
          "Rate limit exceeded. Please wait a moment before trying again."
        );
      } else if (res.status === 401) {
        throw new Error(
          "Invalid API key. Please check your API configuration."
        );
      } else if (res.status === 400) {
        throw new Error(`Invalid request: ${errorMessage}`);
      } else if (res.status === 402) {
        throw new Error(
          "Insufficient credits. Your API account has run out of credits or reached its limit. Please add credits to your account or upgrade your plan to continue using the service."
        );
      } else if (res.status >= 500) {
        throw new Error(
          `Server error (${res.status}): ${errorMessage}. Please try again later.`
        );
      } else {
        throw new Error(`API call failed (${res.status}): ${errorMessage}`);
      }
    }

    const data = await res.json();

    let output = "";
    if (apiKey.provider === "gemini") {
      // Gemini uses data.candidates[0].content.parts[0].text
      output = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } else if (apiKey.provider === "anthropic") {
      // Anthropic uses data.content[0].text
      output = data?.content?.[0]?.text || "";
    } else {
      // OpenAI and OpenRouter use data.choices[0].message.content
      output = data?.choices?.[0]?.message?.content || "";
    }

    return parseModelOutput(output);
  } catch (error) {
    console.error(`[v0] Error generating metadata for ${file.name}:`, error);
    // Ensure error is propagated with a simple message
    throw new Error(error.message || "Failed to generate metadata");
  }
}
