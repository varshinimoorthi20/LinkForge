const Url = require("../models/Url");
const Visit = require("../models/Visit");

// Calculate URL Performance Score helper
const calculatePerformanceScore = (clicks, uniqueCountries, healthStatus, recentClicksCount) => {
  let score = 0;
  
  // Clicks: max 40 points
  score += Math.min(clicks * 2.5, 40);
  
  // Reach (Countries): max 30 points
  score += Math.min(uniqueCountries * 7.5, 30);
  
  // Health: max 20 points
  if (healthStatus === "Healthy") score += 20;
  else if (healthStatus === "Slow") score += 10;
  else if (healthStatus === "Down") score += 0;
  else score += 15; // Unknown
  
  // Recent Activity: max 10 points
  score += Math.min(recentClicksCount * 2, 10);
  
  const finalScore = Math.min(100, Math.max(0, Math.round(score)));
  
  let label = "Needs Improvement";
  if (finalScore >= 90) label = "Excellent";
  else if (finalScore >= 70) label = "Very Good";
  else if (finalScore >= 50) label = "Good";
  else if (finalScore >= 30) label = "Fair";
  
  return { score: finalScore, label };
};

// GET Dashboard Overview Analytics
exports.getAnalyticsOverview = async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user._id });
    const urlIds = urls.map(u => u._id);

    // Fetch all visits for user's URLs
    const allVisits = await Visit.find({ urlId: { $in: urlIds } }).sort({ visitedAt: -1 });

    const totalUrls = urls.length;
    const totalClicks = urls.reduce((sum, u) => sum + u.clickCount, 0);
    const activeUrls = urls.filter(u => !u.expiresAt || new Date(u.expiresAt) > new Date()).length;

    // Most Active Link
    let mostActiveLink = null;
    if (urls.length > 0) {
      const sorted = [...urls].sort((a, b) => b.clickCount - a.clickCount);
      mostActiveLink = sorted[0];
    }

    // Top Country
    const countryCounts = {};
    allVisits.forEach(v => {
      if (v.country) {
        countryCounts[v.country] = (countryCounts[v.country] || 0) + 1;
      }
    });
    let topCountry = "N/A";
    let topCountryClicks = 0;
    Object.keys(countryCounts).forEach(c => {
      if (countryCounts[c] > topCountryClicks) {
        topCountry = c;
        topCountryClicks = countryCounts[c];
      }
    });

    // Weekly Growth (Clicks)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const clicksThisWeek = allVisits.filter(v => new Date(v.visitedAt) >= sevenDaysAgo).length;
    const clicksLastWeek = allVisits.filter(v => {
      const d = new Date(v.visitedAt);
      return d >= fourteenDaysAgo && d < sevenDaysAgo;
    }).length;

    let weeklyGrowth = 0;
    if (clicksLastWeek > 0) {
      weeklyGrowth = ((clicksThisWeek - clicksLastWeek) / clicksLastWeek) * 100;
    } else if (clicksThisWeek > 0) {
      weeklyGrowth = 100; // 100% growth if there were no clicks last week and some this week
    }

    // Category Breakdown & Overall Score
    const categoriesMap = {
      "Technology": { urls: 0, clicks: 0 },
      "Education": { urls: 0, clicks: 0 },
      "Social Media": { urls: 0, clicks: 0 },
      "Shopping": { urls: 0, clicks: 0 },
      "Entertainment": { urls: 0, clicks: 0 },
      "News": { urls: 0, clicks: 0 },
      "Uncategorized": { urls: 0, clicks: 0 }
    };

    let totalScoreSum = 0;

    urls.forEach(url => {
      const cat = url.category || "Uncategorized";
      if (categoriesMap[cat]) {
        categoriesMap[cat].urls += 1;
        categoriesMap[cat].clicks += url.clickCount;
      }

      // Calculate score for each link
      const visitsForLink = allVisits.filter(v => v.urlId.toString() === url._id.toString());
      const countries = new Set(visitsForLink.map(v => v.country));
      const recentVisitsCount = visitsForLink.filter(v => new Date(v.visitedAt) >= sevenDaysAgo).length;
      
      const { score } = calculatePerformanceScore(
        url.clickCount,
        countries.size,
        url.healthStatus || "Unknown",
        recentVisitsCount
      );
      totalScoreSum += score;
    });

    const averagePerformanceScore = urls.length > 0 ? Math.round(totalScoreSum / urls.length) : 0;

    const categoryBreakdown = Object.keys(categoriesMap).map(name => ({
      name,
      urls: categoriesMap[name].urls,
      clicks: categoriesMap[name].clicks
    }));

    // Real-Time Activity Feed (recent 10 visits)
    // Map with original Url details
    const recent10Visits = allVisits.slice(0, 10).map(v => {
      const parentUrl = urls.find(u => u._id.toString() === v.urlId.toString());
      return {
        _id: v._id,
        visitedAt: v.visitedAt,
        browser: v.browser,
        device: v.device,
        country: v.country,
        isQr: v.isQr || false,
        url: parentUrl ? {
          originalUrl: parentUrl.originalUrl,
          shortCode: parentUrl.shortCode,
          category: parentUrl.category
        } : null
      };
    });

    // === SMART INSIGHTS ENGINE ===
    // 1. Most Popular Link
    let mostPopular = null;
    if (urls.length > 0) {
      const sortedPop = [...urls].sort((a, b) => b.clickCount - a.clickCount);
      if (sortedPop[0].clickCount > 0) {
        mostPopular = {
          shortCode: sortedPop[0].shortCode,
          clicks: sortedPop[0].clickCount
        };
      }
    }

    // 2. Fastest Growing Link
    let fastestGrowing = null;
    const recentVisitsCountByUrl = {};
    allVisits.forEach(v => {
      if (new Date(v.visitedAt) >= sevenDaysAgo) {
        recentVisitsCountByUrl[v.urlId] = (recentVisitsCountByUrl[v.urlId] || 0) + 1;
      }
    });
    let maxRecentClicks = 0;
    let fastestUrlId = null;
    Object.keys(recentVisitsCountByUrl).forEach(urlId => {
      if (recentVisitsCountByUrl[urlId] > maxRecentClicks) {
        maxRecentClicks = recentVisitsCountByUrl[urlId];
        fastestUrlId = urlId;
      }
    });
    if (fastestUrlId) {
      const parentUrl = urls.find(u => u._id.toString() === fastestUrlId);
      if (parentUrl) {
        fastestGrowing = {
          shortCode: parentUrl.shortCode,
          recentClicks: maxRecentClicks
        };
      }
    }

    // 3. Top Country
    let topCountryData = null;
    if (topCountry !== "N/A" && topCountryClicks > 0) {
      topCountryData = {
        country: topCountry,
        visits: topCountryClicks
      };
    }

    // 4. Most Used Browser
    let topBrowserData = null;
    const browserCounts = {};
    allVisits.forEach(v => {
      const b = (!v.browser || v.browser.toLowerCase() === "unknown") ? "Chrome" : v.browser;
      browserCounts[b] = (browserCounts[b] || 0) + 1;
    });
    let topBrowserName = "";
    let topBrowserClicks = 0;
    Object.keys(browserCounts).forEach(b => {
      if (browserCounts[b] > topBrowserClicks) {
        topBrowserName = b;
        topBrowserClicks = browserCounts[b];
      }
    });
    if (allVisits.length > 0 && topBrowserClicks > 0) {
      topBrowserData = {
        browser: topBrowserName,
        percentage: Math.round((topBrowserClicks / allVisits.length) * 100)
      };
    }

    // 5. Most Used Device
    let topDeviceData = null;
    const deviceCounts = {};
    allVisits.forEach(v => {
      const d = v.device || "Desktop";
      deviceCounts[d] = (deviceCounts[d] || 0) + 1;
    });
    let topDeviceName = "";
    let topDeviceClicks = 0;
    Object.keys(deviceCounts).forEach(d => {
      if (deviceCounts[d] > topDeviceClicks) {
        topDeviceName = d;
        topDeviceClicks = deviceCounts[d];
      }
    });
    if (allVisits.length > 0 && topDeviceClicks > 0) {
      topDeviceData = {
        device: topDeviceName,
        percentage: Math.round((topDeviceClicks / allVisits.length) * 100)
      };
    }

    // 6. Best Performing URL
    let bestPerforming = null;
    let maxPerfScore = -1;
    urls.forEach(url => {
      const visitsForLink = allVisits.filter(v => v.urlId.toString() === url._id.toString());
      const countries = new Set(visitsForLink.map(v => v.country));
      const recentVisitsCount = visitsForLink.filter(v => new Date(v.visitedAt) >= sevenDaysAgo).length;
      
      const { score, label } = calculatePerformanceScore(
        url.clickCount,
        countries.size,
        url.healthStatus || "Unknown",
        recentVisitsCount
      );
      if (score > maxPerfScore) {
        maxPerfScore = score;
        bestPerforming = {
          shortCode: url.shortCode,
          score,
          label
        };
      }
    });

    // 7. Expiring Soon Alert
    const expiringSoon = [];
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    urls.forEach(url => {
      if (url.expiresAt) {
        const exp = new Date(url.expiresAt);
        const now = new Date();
        if (exp > now && exp <= sevenDaysFromNow) {
          const diffTime = Math.abs(exp - now);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          expiringSoon.push({
            shortCode: url.shortCode,
            daysLeft: diffDays
          });
        }
      }
    });

    // 8. Traffic Alert
    const trafficAlerts = [];
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const visitsIn24h = {};
    allVisits.forEach(v => {
      if (new Date(v.visitedAt) >= oneDayAgo) {
        visitsIn24h[v.urlId] = (visitsIn24h[v.urlId] || 0) + 1;
      }
    });
    Object.keys(visitsIn24h).forEach(urlId => {
      if (visitsIn24h[urlId] > 10) {
        const parentUrl = urls.find(u => u._id.toString() === urlId);
        if (parentUrl) {
          trafficAlerts.push({
            shortCode: parentUrl.shortCode,
            recentClicks: visitsIn24h[urlId]
          });
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalUrls,
          totalClicks,
          activeUrls,
          mostActiveLink,
          topCountry,
          weeklyGrowth: weeklyGrowth.toFixed(1),
          averagePerformanceScore
        },
        categoryBreakdown,
        activityFeed: recent10Visits,
        insights: {
          mostPopular,
          fastestGrowing,
          topCountry: topCountryData,
          mostUsedBrowser: topBrowserData,
          mostUsedDevice: topDeviceData,
          bestPerforming,
          expiringSoon,
          trafficAlerts
        }
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET Specific Link Analytics Details
exports.getLinkAnalyticsDetails = async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });
    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found"
      });
    }

    const visits = await Visit.find({ urlId: url._id }).sort({ visitedAt: -1 });

    // Country Breakdown
    const countryCounts = {};
    const browserCounts = {};
    const deviceCounts = { Desktop: 0, Mobile: 0, Tablet: 0, Unknown: 0 };
    let qrCount = 0;

    visits.forEach(v => {
      const c = v.country || "United States";
      countryCounts[c] = (countryCounts[c] || 0) + 1;

      const b = (!v.browser || v.browser.toLowerCase() === "unknown") ? "Chrome" : v.browser;
      browserCounts[b] = (browserCounts[b] || 0) + 1;

      const d = v.device || "Desktop";
      deviceCounts[d] = (deviceCounts[d] || 0) + 1;

      if (v.isQr) {
        qrCount += 1;
      }
    });

    const countryData = Object.keys(countryCounts).map(name => ({
      name,
      value: countryCounts[name]
    })).sort((a, b) => b.value - a.value);

    const browserData = Object.keys(browserCounts).map(name => ({
      name,
      value: browserCounts[name]
    }));

    const deviceData = Object.keys(deviceCounts).map(name => ({
      name,
      value: deviceCounts[name]
    })).filter(d => d.value > 0);

    // Weekly visits count for activity
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentVisitsCount = visits.filter(v => new Date(v.visitedAt) >= sevenDaysAgo).length;

    // Performance Score
    const { score, label } = calculatePerformanceScore(
      url.clickCount,
      countryData.length,
      url.healthStatus || "Unknown",
      recentVisitsCount
    );

    // Ranking System (based on clicks & score)
    let ranking = "Bronze";
    if (url.clickCount >= 50 || score >= 80) {
      ranking = "Gold";
    } else if (url.clickCount >= 10 || score >= 50) {
      ranking = "Silver";
    }

    res.status(200).json({
      success: true,
      data: {
        url,
        metrics: {
          totalClicks: url.clickCount,
          qrClicks: qrCount,
          lastVisited: visits.length > 0 ? visits[0].visitedAt : null,
          recentVisits: visits.slice(0, 50), // Send last 50 visits
          performanceScore: score,
          performanceLabel: label,
          ranking,
          healthStatus: url.healthStatus || "Unknown"
        },
        distributions: {
          countries: countryData,
          browsers: browserData,
          devices: deviceData
        }
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
