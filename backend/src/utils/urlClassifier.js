const classifyUrl = (url) => {
  if (!url) return "Uncategorized";

  const urlLower = url.toLowerCase();

  // 1. Social Media
  const socialDomains = [
    "facebook.com", "twitter.com", "x.com", "instagram.com", "linkedin.com",
    "reddit.com", "tiktok.com", "youtube.com", "t.co", "pinterest.com",
    "whatsapp.com", "snapchat.com", "telegram.org", "discord.com", "twitch.tv"
  ];
  if (socialDomains.some(domain => urlLower.includes(domain))) {
    return "Social Media";
  }

  // 2. Shopping
  const shoppingDomains = [
    "amazon.com", "amazon.in", "amazon.co.uk", "ebay.com", "shopify.com", "walmart.com",
    "target.com", "etsy.com", "aliexpress.com", "flipkart.com", "bestbuy.com",
    "taobao.com", "jd.com"
  ];
  if (shoppingDomains.some(domain => urlLower.includes(domain))) {
    return "Shopping";
  }

  // 3. Entertainment
  const entertainmentDomains = [
    "netflix.com", "spotify.com", "hulu.com", "disneyplus.com", "hbomax.com",
    "soundcloud.com", "vimeo.com", "imdb.com", "steamcommunity.com",
    "steampowered.com", "epicgames.com", "crunchyroll.com"
  ];
  if (entertainmentDomains.some(domain => urlLower.includes(domain))) {
    return "Entertainment";
  }

  // 4. News
  const newsDomains = [
    "nytimes.com", "cnn.com", "bbc.com", "bbc.co.uk", "reuters.com", "theguardian.com",
    "guardian.co.uk", "bloomberg.com", "forbes.com", "wsj.com", "time.com",
    "huffpost.com", "cnbc.com", "foxnews.com", "aljazeera.com", "techcrunch.com"
  ];
  if (newsDomains.some(domain => urlLower.includes(domain))) {
    return "News";
  }

  // 5. Education
  const educationKeywords = [
    "wikipedia.org", "coursera.org", "udemy.com", "edx.org", "khanacademy.org",
    "scholar.google.com", "mit.edu", "harvard.edu", "stanford.edu", "berkeley.edu",
    "edu", "quizlet.com", "duolingo.com", "researchgate.net", "codecademy.com"
  ];
  if (educationKeywords.some(keyword => urlLower.includes(keyword))) {
    return "Education";
  }

  // 6. Technology
  const techKeywords = [
    "github.com", "stackoverflow.com", "medium.com", "dev.to", "vercel.com",
    "linear.app", "aws.amazon.com", "microsoft.com", "google.com", "apple.com",
    "npmjs.com", "gitlab.com", "bitbucket.org", "heroku.com", "digitalocean.com",
    "docker.com", "docker.io", "kubernetes.io", "npm", "cloudflare.com", "developer"
  ];
  if (techKeywords.some(keyword => urlLower.includes(keyword))) {
    return "Technology";
  }

  // Heuristics based on URL substring
  if (urlLower.includes("shop") || urlLower.includes("store") || urlLower.includes("buy")) {
    return "Shopping";
  }
  if (urlLower.includes("learn") || urlLower.includes("edu") || urlLower.includes("course") || urlLower.includes("class") || urlLower.includes("science")) {
    return "Education";
  }
  if (urlLower.includes("tech") || urlLower.includes("code") || urlLower.includes("dev") || urlLower.includes("api") || urlLower.includes("app")) {
    return "Technology";
  }
  if (urlLower.includes("news") || urlLower.includes("daily") || urlLower.includes("post") || urlLower.includes("times")) {
    return "News";
  }
  if (urlLower.includes("play") || urlLower.includes("game") || urlLower.includes("music") || urlLower.includes("movie") || urlLower.includes("tv")) {
    return "Entertainment";
  }
  if (urlLower.includes("social") || urlLower.includes("chat") || urlLower.includes("meet") || urlLower.includes("forum")) {
    return "Social Media";
  }

  return "Uncategorized";
};

module.exports = classifyUrl;
