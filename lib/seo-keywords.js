// Stock SEO-friendly keywords for different categories
export const SEO_KEYWORDS = {
  general: [
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
    "creative",
    "innovative",
    "premium",
    "elegant",
    "stylish",
    "sophisticated",
    "beautiful",
    "stunning",
    "amazing",
    "impressive",
    "outstanding",
    "exceptional",
    "remarkable",
    "extraordinary",
    "magnificent",
    "spectacular",
    "trending",
    "popular",
    "engaging",
    "captivating",
    "inspiring",
    "motivational",
    "uplifting",
    "positive",
    "optimistic",
    "digital",
    "technology",
    "innovation",
  ],

  business: [
    "corporate",
    "professional",
    "business",
    "commercial",
    "enterprise",
    "industry",
    "market",
    "success",
    "growth",
    "development",
    "strategy",
    "leadership",
    "management",
    "executive",
    "team",
    "collaboration",
    "partnership",
    "networking",
    "conference",
    "meeting",
    "presentation",
    "report",
    "analysis",
    "data",
    "statistics",
    "performance",
    "results",
    "achievement",
    "goal",
    "objective",
    "solution",
    "service",
    "product",
    "brand",
    "marketing",
    "advertising",
    "promotion",
    "campaign",
    "customer",
    "client",
  ],

  lifestyle: [
    "lifestyle",
    "wellness",
    "health",
    "fitness",
    "nutrition",
    "beauty",
    "fashion",
    "style",
    "trend",
    "comfort",
    "relaxation",
    "leisure",
    "hobby",
    "entertainment",
    "fun",
    "enjoyment",
    "happiness",
    "joy",
    "celebration",
    "party",
    "family",
    "friends",
    "social",
    "community",
    "culture",
    "tradition",
    "heritage",
    "experience",
    "memory",
    "moment",
    "travel",
    "adventure",
    "exploration",
    "discovery",
    "journey",
    "destination",
    "vacation",
    "holiday",
    "tourism",
    "wanderlust",
  ],

  creative: [
    "art",
    "design",
    "creative",
    "artistic",
    "visual",
    "aesthetic",
    "composition",
    "color",
    "texture",
    "pattern",
    "illustration",
    "graphic",
    "photography",
    "image",
    "picture",
    "photo",
    "portrait",
    "landscape",
    "abstract",
    "conceptual",
    "inspiration",
    "imagination",
    "creativity",
    "expression",
    "style",
    "technique",
    "skill",
    "talent",
    "craft",
    "masterpiece",
    "gallery",
    "exhibition",
    "showcase",
    "collection",
    "portfolio",
    "artwork",
    "creation",
    "original",
    "unique",
    "custom",
  ],

  technology: [
    "technology",
    "digital",
    "software",
    "hardware",
    "computer",
    "internet",
    "web",
    "online",
    "mobile",
    "app",
    "artificial intelligence",
    "AI",
    "machine learning",
    "automation",
    "innovation",
    "development",
    "programming",
    "coding",
    "system",
    "platform",
    "cloud",
    "data",
    "analytics",
    "algorithm",
    "interface",
    "user experience",
    "UX",
    "UI",
    "responsive",
    "interactive",
    "security",
    "privacy",
    "encryption",
    "blockchain",
    "cryptocurrency",
    "fintech",
    "startup",
    "tech",
    "gadget",
    "device",
  ],
};

export function generateSEOKeywords(category = "general", count = 35) {
  const keywords = SEO_KEYWORDS[category] || SEO_KEYWORDS.general;
  const shuffled = [...keywords].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, keywords.length));
}

export function validateKeywords(keywords) {
  const keywordArray = keywords
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
  const count = keywordArray.length;

  if (count < 30) {
    return {
      isValid: false,
      count,
      message: `Adobe Stock requires at least 30 keywords. Currently have ${count}.`,
    };
  }

  if (count > 49) {
    return {
      isValid: false,
      count,
      message: `Adobe Stock allows maximum 49 keywords. Currently have ${count}.`,
    };
  }

  return {
    isValid: true,
    count,
    message: `Perfect! ${count} keywords meet Adobe Stock requirements.`,
  };
}

export function ensureKeywordCount(keywords, targetCount = 35) {
  const keywordArray = keywords
    .split(",")
    .map((k) => k.trim().replace(/-/g, " ").replace(/\s+/g, " ")) // Remove dashes, normalize spaces
    .filter((k) => k.length > 0);

  if (keywordArray.length >= 30 && keywordArray.length <= 49) {
    return keywordArray.join(", "); // Already in valid range, return cleaned
  }

  if (keywordArray.length < 30) {
    // Add stock photography keywords to reach minimum
    const needed = Math.max(30, targetCount) - keywordArray.length;
    const stockKeywords = [
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
      "creative",
      "nobody",
      "indoors",
      "outdoors",
      "day",
      "natural light",
      "close up",
      "wide shot",
      "horizontal",
      "vertical",
    ];

    const additionalKeywords = stockKeywords
      .filter(
        (k) =>
          !keywordArray.some((existing) =>
            existing.toLowerCase().includes(k.toLowerCase())
          )
      )
      .slice(0, needed);

    return [...keywordArray, ...additionalKeywords].join(", ");
  }

  if (keywordArray.length > 49) {
    // Trim to maximum allowed by Adobe Stock
    return keywordArray.slice(0, 49).join(", ");
  }

  return keywordArray.join(", ");
}
