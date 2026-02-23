import type {
  Campaign,
  Asset,
  MetricSnapshot,
  Insight,
  Alert,
  AutoAction,
} from "../types";

// ─── Campaigns ───────────────────────────────────────────────────

export const seedCampaigns: Campaign[] = [
  {
    id: "camp-001",
    orgId: null,
    name: "LinkedIn B2B Lead Gen — Q1 2026",
    platform: "linkedin",
    status: "active",
    budget: 15000,
    spent: 9875,
    audienceSegment: "B2B SaaS Decision Makers",
    icpPersona: "VP of Marketing, 50-500 employees, Series A-C",
    funnelStage: "tofu",
    offerType: "whitepaper",
    tags: ["q1-2026", "lead-gen", "linkedin"],
    startDate: "2026-01-15",
    endDate: "2026-03-31",
    createdAt: "2026-01-10T10:00:00Z",
    updatedAt: "2026-02-18T14:30:00Z",
  },
  {
    id: "camp-002",
    orgId: null,
    name: "Google Search — Demo Bookings",
    platform: "google",
    status: "active",
    budget: 20000,
    spent: 12450,
    audienceSegment: "High-Intent Marketing Leaders",
    icpPersona: "CMO/Head of Growth, 100-1000 employees",
    funnelStage: "bofu",
    offerType: "demo",
    tags: ["q1-2026", "search", "demos"],
    startDate: "2026-01-01",
    endDate: "2026-03-31",
    createdAt: "2025-12-28T09:00:00Z",
    updatedAt: "2026-02-19T11:00:00Z",
  },
  {
    id: "camp-003",
    orgId: null,
    name: "YouTube Brand Awareness — Thought Leadership",
    platform: "youtube",
    status: "active",
    budget: 8000,
    spent: 4200,
    audienceSegment: "Marketing Professionals",
    icpPersona: "Marketing Manager, all company sizes",
    funnelStage: "tofu",
    offerType: "webinar",
    tags: ["q1-2026", "brand", "video"],
    startDate: "2026-02-01",
    endDate: "2026-04-30",
    createdAt: "2026-01-25T08:00:00Z",
    updatedAt: "2026-02-17T16:00:00Z",
  },
];

// ─── Assets ──────────────────────────────────────────────────────

export const seedAssets: Asset[] = [
  // Campaign 1: LinkedIn Lead Gen
  {
    id: "asset-001",
    orgId: null,
    name: "LinkedIn Carousel — 5 Signs Your Marketing Is Fatigued",
    type: "social_post",
    status: "active",
    platform: "linkedin",
    campaignId: "camp-001",
    audienceSegment: "B2B SaaS Decision Makers",
    icpPersona: "VP of Marketing",
    funnelStage: "tofu",
    offerType: "whitepaper",
    creativeTheme: "Pain Point Agitation",
    hook: "Your best-performing ad is dying. Here's the data.",
    cta: "Download the Fatigue Playbook",
    bodyContent: "Carousel highlighting 5 indicators of creative fatigue with benchmarks and solutions.",
    version: 2,
    parentAssetId: null,
    fileUrl: null,
    thumbnailUrl: null,
    landingPageUrl: "https://rampright.io/fatigue-playbook",
    tags: ["carousel", "fatigue", "educational"],
    notes: "Top performer — 3.2% CTR, strong engagement",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-02-10T14:00:00Z",
  },
  {
    id: "asset-002",
    orgId: null,
    name: "LinkedIn Single Image — ROI Calculator Promo",
    type: "image",
    status: "fatigued",
    platform: "linkedin",
    campaignId: "camp-001",
    audienceSegment: "B2B SaaS Decision Makers",
    icpPersona: "VP of Marketing",
    funnelStage: "tofu",
    offerType: "whitepaper",
    creativeTheme: "Tool/Calculator",
    hook: "What's your real cost per lead? (It's not what your dashboard says.)",
    cta: "Calculate Your True CPL",
    bodyContent: "Single image ad promoting interactive ROI calculator with bold stat graphic.",
    version: 1,
    parentAssetId: null,
    fileUrl: null,
    thumbnailUrl: null,
    landingPageUrl: "https://rampright.io/roi-calc",
    tags: ["single-image", "calculator", "cpl"],
    notes: "CTR dropped from 2.1% to 0.8% over 3 weeks — needs refresh",
    createdAt: "2026-01-16T11:00:00Z",
    updatedAt: "2026-02-15T09:00:00Z",
  },
  {
    id: "asset-003",
    orgId: null,
    name: "LinkedIn Video — Customer Success Story: Acme Corp",
    type: "video",
    status: "active",
    platform: "linkedin",
    campaignId: "camp-001",
    audienceSegment: "B2B SaaS Decision Makers",
    icpPersona: "VP of Marketing",
    funnelStage: "mofu",
    offerType: "case_study",
    creativeTheme: "Social Proof",
    hook: "How Acme Corp cut their CPL by 40% in 6 weeks",
    cta: "Read the Full Case Study",
    bodyContent: "60-second testimonial video featuring Acme Corp's marketing director.",
    version: 1,
    parentAssetId: null,
    fileUrl: null,
    thumbnailUrl: null,
    landingPageUrl: "https://rampright.io/case-study/acme",
    tags: ["video", "testimonial", "case-study"],
    notes: "Good engagement but lower conversion than expected",
    createdAt: "2026-01-20T14:00:00Z",
    updatedAt: "2026-02-12T10:00:00Z",
  },
  {
    id: "asset-004",
    orgId: null,
    name: "LinkedIn Lead Gen Form — Whitepaper Download",
    type: "lead_magnet",
    status: "active",
    platform: "linkedin",
    campaignId: "camp-001",
    audienceSegment: "B2B SaaS Decision Makers",
    icpPersona: "VP of Marketing",
    funnelStage: "tofu",
    offerType: "whitepaper",
    creativeTheme: "Data-Driven Authority",
    hook: "The 2026 Marketing Fatigue Report is here",
    cta: "Get Your Free Copy",
    bodyContent: "LinkedIn native lead gen form collecting name, title, company for whitepaper delivery.",
    version: 1,
    parentAssetId: null,
    fileUrl: null,
    thumbnailUrl: null,
    landingPageUrl: null,
    tags: ["lead-gen-form", "whitepaper", "gated"],
    notes: "Paired with asset-001 carousel",
    createdAt: "2026-01-15T10:30:00Z",
    updatedAt: "2026-02-10T14:00:00Z",
  },
  {
    id: "asset-005",
    orgId: null,
    name: "LinkedIn Text Ad — Quick Demo CTA",
    type: "ad",
    status: "paused",
    platform: "linkedin",
    campaignId: "camp-001",
    audienceSegment: "B2B SaaS Decision Makers",
    icpPersona: "VP of Marketing",
    funnelStage: "bofu",
    offerType: "demo",
    creativeTheme: "Direct Response",
    hook: "See RampRight in action — 15 min, no commitment",
    cta: "Book Your Demo",
    bodyContent: "Concise text ad targeting engaged LinkedIn users who visited content.",
    version: 1,
    parentAssetId: null,
    fileUrl: null,
    thumbnailUrl: null,
    landingPageUrl: "https://rampright.io/demo",
    tags: ["text-ad", "demo", "retargeting"],
    notes: "Paused — testing different CTA variations",
    createdAt: "2026-01-22T09:00:00Z",
    updatedAt: "2026-02-05T11:00:00Z",
  },

  // Campaign 2: Google Search — Demo Bookings
  {
    id: "asset-006",
    orgId: null,
    name: "Google RSA — Marketing Optimization Platform",
    type: "ad",
    status: "active",
    platform: "google",
    campaignId: "camp-002",
    audienceSegment: "High-Intent Marketing Leaders",
    icpPersona: "CMO/Head of Growth",
    funnelStage: "bofu",
    offerType: "demo",
    creativeTheme: "Solution Positioning",
    hook: "Stop Guessing, Start Optimizing",
    cta: "Get a Free Demo",
    bodyContent: "Responsive search ad with 15 headlines and 4 descriptions targeting 'marketing optimization software'.",
    version: 3,
    parentAssetId: null,
    fileUrl: null,
    thumbnailUrl: null,
    landingPageUrl: "https://rampright.io/demo",
    tags: ["rsa", "search", "high-intent"],
    notes: "Top converter — 8.2% CVR from click to demo",
    createdAt: "2026-01-01T08:00:00Z",
    updatedAt: "2026-02-18T16:00:00Z",
  },
  {
    id: "asset-007",
    orgId: null,
    name: "Google RSA — Creative Fatigue Solution",
    type: "ad",
    status: "active",
    platform: "google",
    campaignId: "camp-002",
    audienceSegment: "High-Intent Marketing Leaders",
    icpPersona: "CMO/Head of Growth",
    funnelStage: "bofu",
    offerType: "demo",
    creativeTheme: "Problem-Solution",
    hook: "Ad Fatigue Killing Your ROAS?",
    cta: "See How We Fix It",
    bodyContent: "RSA targeting 'creative fatigue' and 'ad fatigue solution' keywords.",
    version: 2,
    parentAssetId: null,
    fileUrl: null,
    thumbnailUrl: null,
    landingPageUrl: "https://rampright.io/fatigue-solution",
    tags: ["rsa", "search", "fatigue"],
    notes: "Good CTR but lower conversion than asset-006",
    createdAt: "2026-01-05T10:00:00Z",
    updatedAt: "2026-02-16T13:00:00Z",
  },
  {
    id: "asset-008",
    orgId: null,
    name: "Landing Page — Demo Booking (Main)",
    type: "landing_page",
    status: "active",
    platform: "google",
    campaignId: "camp-002",
    audienceSegment: "High-Intent Marketing Leaders",
    icpPersona: "CMO/Head of Growth",
    funnelStage: "bofu",
    offerType: "demo",
    creativeTheme: "Trust & Authority",
    hook: "The Marketing Optimization Platform Trusted by 200+ Teams",
    cta: "Book Your 15-Min Demo",
    bodyContent: "Full landing page with hero, social proof, feature grid, testimonials, and booking form.",
    version: 4,
    parentAssetId: null,
    fileUrl: null,
    thumbnailUrl: null,
    landingPageUrl: "https://rampright.io/demo",
    tags: ["landing-page", "demo", "high-converting"],
    notes: "12% form completion rate",
    createdAt: "2025-12-28T09:00:00Z",
    updatedAt: "2026-02-14T15:00:00Z",
  },
  {
    id: "asset-009",
    orgId: null,
    name: "Google RSA — Competitor Comparison",
    type: "ad",
    status: "active",
    platform: "google",
    campaignId: "camp-002",
    audienceSegment: "High-Intent Marketing Leaders",
    icpPersona: "CMO/Head of Growth",
    funnelStage: "bofu",
    offerType: "demo",
    creativeTheme: "Competitive Differentiation",
    hook: "RampRight vs [Competitor] — See the Difference",
    cta: "Compare & Book Demo",
    bodyContent: "RSA targeting competitor brand keywords with comparison messaging.",
    version: 1,
    parentAssetId: null,
    fileUrl: null,
    thumbnailUrl: null,
    landingPageUrl: "https://rampright.io/compare",
    tags: ["rsa", "competitor", "comparison"],
    notes: "New — launched Feb 10, early data promising",
    createdAt: "2026-02-10T08:00:00Z",
    updatedAt: "2026-02-18T10:00:00Z",
  },
  {
    id: "asset-010",
    orgId: null,
    name: "Google Display — Retargeting Banner Set",
    type: "image",
    status: "active",
    platform: "google",
    campaignId: "camp-002",
    audienceSegment: "Website Visitors (non-converted)",
    icpPersona: "CMO/Head of Growth",
    funnelStage: "bofu",
    offerType: "demo",
    creativeTheme: "Urgency & FOMO",
    hook: "Still thinking? Your competitors aren't.",
    cta: "Book Demo Now",
    bodyContent: "Display banner set (300x250, 728x90, 160x600) for retargeting site visitors.",
    version: 2,
    parentAssetId: null,
    fileUrl: null,
    thumbnailUrl: null,
    landingPageUrl: "https://rampright.io/demo",
    tags: ["display", "retargeting", "banners"],
    notes: "Decent click-through on retargeting audiences",
    createdAt: "2026-01-15T12:00:00Z",
    updatedAt: "2026-02-12T09:00:00Z",
  },

  // Campaign 3: YouTube Brand Awareness
  {
    id: "asset-011",
    orgId: null,
    name: "YouTube Pre-Roll — Why Marketing Teams Burn Out",
    type: "video",
    status: "active",
    platform: "youtube",
    campaignId: "camp-003",
    audienceSegment: "Marketing Professionals",
    icpPersona: "Marketing Manager",
    funnelStage: "tofu",
    offerType: "webinar",
    creativeTheme: "Emotional Hook",
    hook: "Your team creates 47 ads a month. Only 3 actually work.",
    cta: "Watch the Full Webinar",
    bodyContent: "15-second skippable pre-roll highlighting the pain of creative waste.",
    version: 1,
    parentAssetId: null,
    fileUrl: null,
    thumbnailUrl: null,
    landingPageUrl: "https://rampright.io/webinar",
    tags: ["pre-roll", "brand-awareness", "emotional"],
    notes: "Strong view-through rate at 62%",
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-02-17T14:00:00Z",
  },
  {
    id: "asset-012",
    orgId: null,
    name: "YouTube In-Stream — Product Demo Teaser",
    type: "video",
    status: "active",
    platform: "youtube",
    campaignId: "camp-003",
    audienceSegment: "Marketing Professionals",
    icpPersona: "Marketing Manager",
    funnelStage: "mofu",
    offerType: "demo",
    creativeTheme: "Product Showcase",
    hook: "What if your dashboard told you WHAT to do next?",
    cta: "See It In Action",
    bodyContent: "30-second in-stream ad showing product UI with overlay text and narration.",
    version: 2,
    parentAssetId: null,
    fileUrl: null,
    thumbnailUrl: null,
    landingPageUrl: "https://rampright.io/demo",
    tags: ["in-stream", "product-demo", "mid-funnel"],
    notes: "Good completion rate, testing new thumbnail",
    createdAt: "2026-02-05T11:00:00Z",
    updatedAt: "2026-02-16T09:00:00Z",
  },
  {
    id: "asset-013",
    orgId: null,
    name: "YouTube Bumper — Brand Tagline",
    type: "video",
    status: "active",
    platform: "youtube",
    campaignId: "camp-003",
    audienceSegment: "Marketing Professionals",
    icpPersona: "Marketing Manager",
    funnelStage: "tofu",
    offerType: "webinar",
    creativeTheme: "Brand Identity",
    hook: "RampRight — Know what works, fix what doesn't.",
    cta: "Learn More",
    bodyContent: "6-second non-skippable bumper ad with animated logo and tagline.",
    version: 1,
    parentAssetId: null,
    fileUrl: null,
    thumbnailUrl: null,
    landingPageUrl: "https://rampright.io",
    tags: ["bumper", "brand", "short-form"],
    notes: "High impressions, brand lift study pending",
    createdAt: "2026-02-03T08:00:00Z",
    updatedAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "asset-014",
    orgId: null,
    name: "Email Sequence — Webinar Follow-Up (3-part)",
    type: "email",
    status: "active",
    platform: "email",
    campaignId: "camp-003",
    audienceSegment: "Webinar Registrants",
    icpPersona: "Marketing Manager",
    funnelStage: "mofu",
    offerType: "webinar",
    creativeTheme: "Nurture & Educate",
    hook: "You registered for our webinar — here's what you'll learn",
    cta: "Add to Calendar",
    bodyContent: "3-email drip: confirmation + agenda preview, day-of reminder, post-event replay + CTA.",
    version: 1,
    parentAssetId: null,
    fileUrl: null,
    thumbnailUrl: null,
    landingPageUrl: "https://rampright.io/webinar",
    tags: ["email", "nurture", "webinar"],
    notes: "42% open rate on email 1, 28% on email 3",
    createdAt: "2026-02-01T12:00:00Z",
    updatedAt: "2026-02-14T11:00:00Z",
  },
  {
    id: "asset-015",
    orgId: null,
    name: "LinkedIn Sponsored Article — The Death of Spray-and-Pray Marketing",
    type: "copy",
    status: "draft",
    platform: "linkedin",
    campaignId: "camp-001",
    audienceSegment: "B2B SaaS Decision Makers",
    icpPersona: "VP of Marketing",
    funnelStage: "tofu",
    offerType: "newsletter",
    creativeTheme: "Thought Leadership",
    hook: "We analyzed 10,000 B2B ads. The results will change how you budget.",
    cta: "Subscribe for Weekly Insights",
    bodyContent: "Long-form sponsored article with original research data on ad performance decay patterns.",
    version: 1,
    parentAssetId: null,
    fileUrl: null,
    thumbnailUrl: null,
    landingPageUrl: "https://rampright.io/blog/spray-and-pray",
    tags: ["article", "thought-leadership", "research"],
    notes: "Draft — pending final data review",
    createdAt: "2026-02-15T09:00:00Z",
    updatedAt: "2026-02-18T16:00:00Z",
  },
  {
    id: "asset-016",
    orgId: null,
    name: "Landing Page — Webinar Registration",
    type: "landing_page",
    status: "active",
    platform: "website",
    campaignId: "camp-003",
    audienceSegment: "Marketing Professionals",
    icpPersona: "Marketing Manager",
    funnelStage: "tofu",
    offerType: "webinar",
    creativeTheme: "Event Promotion",
    hook: "Free Webinar: How Top Teams Eliminate Creative Fatigue",
    cta: "Reserve Your Spot",
    bodyContent: "Webinar registration page with speaker bios, agenda, and countdown timer.",
    version: 2,
    parentAssetId: null,
    fileUrl: null,
    thumbnailUrl: null,
    landingPageUrl: "https://rampright.io/webinar",
    tags: ["landing-page", "webinar", "registration"],
    notes: "18% registration rate from YouTube traffic",
    createdAt: "2026-01-28T14:00:00Z",
    updatedAt: "2026-02-13T10:00:00Z",
  },
];

// ─── Metric Snapshots ────────────────────────────────────────────

function generateMetrics(
  assetId: string,
  profile: "top_performer" | "fatiguing" | "mismatched" | "new" | "steady",
  startDate: Date,
  days: number,
  baseSpend: number
): MetricSnapshot[] {
  const metrics: MetricSnapshot[] = [];

  for (let d = 0; d < days; d++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + d);
    const dayFactor = d / days;

    let impressions: number,
      ctr: number,
      convRate: number,
      leadRate: number;

    switch (profile) {
      case "top_performer":
        impressions = 2000 + Math.floor(Math.random() * 800) + d * 30;
        ctr = 0.028 + Math.random() * 0.01 + dayFactor * 0.005;
        convRate = 0.06 + Math.random() * 0.02;
        leadRate = 0.04 + Math.random() * 0.015;
        break;
      case "fatiguing":
        impressions = 2500 + Math.floor(Math.random() * 500) - d * 15;
        ctr = Math.max(0.005, 0.025 - dayFactor * 0.018 + Math.random() * 0.004);
        convRate = Math.max(0.01, 0.05 - dayFactor * 0.035 + Math.random() * 0.01);
        leadRate = Math.max(0.005, 0.03 - dayFactor * 0.02 + Math.random() * 0.005);
        break;
      case "mismatched":
        impressions = 3000 + Math.floor(Math.random() * 1000);
        ctr = 0.008 + Math.random() * 0.006;
        convRate = 0.01 + Math.random() * 0.008;
        leadRate = 0.005 + Math.random() * 0.005;
        break;
      case "new":
        impressions = d < 5 ? 500 + d * 200 : 1500 + Math.floor(Math.random() * 500);
        ctr = d < 5 ? 0.015 + Math.random() * 0.01 : 0.02 + Math.random() * 0.008;
        convRate = d < 5 ? 0.03 + Math.random() * 0.02 : 0.045 + Math.random() * 0.015;
        leadRate = d < 5 ? 0.015 + Math.random() * 0.01 : 0.025 + Math.random() * 0.01;
        break;
      case "steady":
      default:
        impressions = 1800 + Math.floor(Math.random() * 600);
        ctr = 0.018 + Math.random() * 0.008;
        convRate = 0.035 + Math.random() * 0.015;
        leadRate = 0.02 + Math.random() * 0.01;
        break;
    }

    const reach = Math.floor(impressions * (0.7 + Math.random() * 0.2));
    const clicks = Math.floor(impressions * ctr);
    const landingPageClicks = Math.floor(clicks * (0.6 + Math.random() * 0.3));
    const conversions = Math.floor(clicks * convRate);
    const leads = Math.floor(clicks * leadRate);
    const demos = Math.floor(leads * (0.15 + Math.random() * 0.15));
    const spend = baseSpend * (0.85 + Math.random() * 0.3);

    const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;
    const cpl = leads > 0 ? spend / leads : 0;
    const costPerDemo = demos > 0 ? spend / demos : 0;
    const roas = spend > 0 ? (leads * 150) / spend : 0;

    metrics.push({
      id: `metric-${assetId}-${d.toString().padStart(3, "0")}`,
      assetId,
      date: date.toISOString().split("T")[0],
      impressions,
      reach,
      clicks,
      landingPageClicks,
      conversions,
      leads,
      demos,
      spend: Math.round(spend * 100) / 100,
      cpm: Math.round(cpm * 100) / 100,
      ctr: Math.round(ctr * 10000) / 10000,
      cpc: Math.round(cpc * 100) / 100,
      conversionRate: Math.round(convRate * 10000) / 10000,
      cpl: Math.round(cpl * 100) / 100,
      costPerDemo: Math.round(costPerDemo * 100) / 100,
      roas: Math.round(roas * 100) / 100,
    });
  }

  return metrics;
}

const startDate = new Date("2026-01-21");

export const seedMetrics: MetricSnapshot[] = [
  // Campaign 1: LinkedIn
  ...generateMetrics("asset-001", "top_performer", startDate, 30, 45),
  ...generateMetrics("asset-002", "fatiguing", startDate, 30, 55),
  ...generateMetrics("asset-003", "steady", startDate, 30, 40),
  ...generateMetrics("asset-004", "steady", startDate, 30, 35),
  ...generateMetrics("asset-005", "mismatched", new Date("2026-01-22"), 14, 30),

  // Campaign 2: Google Search
  ...generateMetrics("asset-006", "top_performer", startDate, 30, 80),
  ...generateMetrics("asset-007", "steady", startDate, 30, 65),
  ...generateMetrics("asset-008", "steady", startDate, 30, 20),
  ...generateMetrics("asset-009", "new", new Date("2026-02-10"), 10, 50),
  ...generateMetrics("asset-010", "fatiguing", startDate, 30, 35),

  // Campaign 3: YouTube
  ...generateMetrics("asset-011", "steady", new Date("2026-02-01"), 19, 30),
  ...generateMetrics("asset-012", "top_performer", new Date("2026-02-05"), 15, 25),
  ...generateMetrics("asset-013", "steady", new Date("2026-02-03"), 17, 15),
  ...generateMetrics("asset-014", "steady", new Date("2026-02-01"), 19, 10),
  ...generateMetrics("asset-016", "new", new Date("2026-02-01"), 19, 12),
];

// ─── Insights ────────────────────────────────────────────────────

export const seedInsights: Insight[] = [
  {
    id: "insight-001",
    orgId: null,
    type: "diagnosis",
    assetId: "asset-002",
    campaignId: "camp-001",
    title: "Creative Fatigue Detected: ROI Calculator Ad",
    summary: "CTR has declined 62% over the past 3 weeks, indicating severe creative fatigue.",
    details: `## Fatigue Analysis: LinkedIn ROI Calculator Ad

**Current CTR:** 0.8% (down from 2.1% peak)
**Decline Rate:** -62% over 21 days
**Fatigue Score:** 82/100

### Key Indicators
- CTR has dropped below the campaign average of 1.8%
- Frequency has exceeded 4.2x for the target audience
- Click-through peaked on day 7 and has declined steadily since

### Root Cause
The audience has been overexposed to this creative. The single-image format with static messaging lacks the novelty to maintain engagement after initial exposure.

### Recommended Actions
1. **Immediate:** Pause this asset to prevent further budget waste
2. **Short-term:** Create a carousel version with the same message but varied visuals
3. **Medium-term:** Rotate in 2-3 new creatives to maintain audience interest`,
    confidence: 0.92,
    impactLevel: "high",
    actionItems: [
      "Pause asset-002 immediately",
      "Create carousel variant with fresh visuals",
      "Set up frequency cap of 3x per week",
    ],
    generatedContent: null,
    createdAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "insight-002",
    orgId: null,
    type: "recommendation",
    assetId: "asset-001",
    campaignId: "camp-001",
    title: "Scale Top Performer: Fatigue Playbook Carousel",
    summary: "This carousel is outperforming all other LinkedIn assets by 2x. Recommend increasing budget allocation.",
    details: `## Performance Analysis: Fatigue Playbook Carousel

**CTR:** 3.2% (campaign avg: 1.8%)
**CPL:** $28.50 (campaign avg: $45.20)
**Lead Quality Score:** 8.2/10

### Why It's Working
- The pain-point hook resonates strongly with the ICP
- Carousel format drives higher engagement than static images
- Educational content builds trust before the CTA

### Recommendations
1. Increase daily budget allocation by 40%
2. Create 2 similar carousels with different pain points
3. Test a video version of the same content for YouTube`,
    confidence: 0.88,
    impactLevel: "high",
    actionItems: [
      "Increase asset-001 budget by 40%",
      "Brief 2 new carousels based on this template",
      "Test video adaptation for YouTube",
    ],
    generatedContent: null,
    createdAt: "2026-02-16T09:00:00Z",
  },
  {
    id: "insight-003",
    orgId: null,
    type: "explanation",
    assetId: "asset-005",
    campaignId: "camp-001",
    title: "Audience Mismatch: Text Ad Targeting Wrong Segment",
    summary: "The BOFU demo CTA is being shown to TOFU audience — causing poor conversion rates.",
    details: `## Audience Mismatch Analysis

**Issue:** Asset-005 (Text Ad — Quick Demo CTA) is running within a TOFU campaign but uses a BOFU offer.

### The Problem
- Campaign targeting: B2B SaaS Decision Makers (broad, awareness-stage)
- Asset offer: Demo booking (requires high intent)
- Result: 0.3% conversion rate vs 2.1% campaign average

### Impact
- $450 wasted spend over 14 days
- Occupying ad inventory that could serve better-matched creatives
- Potentially negative brand impression (asking cold audience for demos)

### Fix
Move this asset to Campaign 2 (Google Search — Demo Bookings) where the audience has demonstrated high intent through search behavior.`,
    confidence: 0.95,
    impactLevel: "medium",
    actionItems: [
      "Move asset-005 to campaign camp-002",
      "Pause until reassignment is complete",
      "Update targeting to match BOFU audience",
    ],
    generatedContent: null,
    createdAt: "2026-02-14T14:00:00Z",
  },
  {
    id: "insight-004",
    orgId: null,
    type: "recommendation",
    assetId: null,
    campaignId: "camp-002",
    title: "Budget Reallocation: Shift Spend from Display to Search",
    summary: "Google Search RSAs are converting at 4x the rate of display retargeting. Recommend shifting 30% of display budget.",
    details: `## Channel Efficiency Analysis: Campaign 2

| Channel | CVR | CPL | ROAS |
|---------|-----|-----|------|
| Search RSA (asset-006) | 8.2% | $32 | 4.7x |
| Search RSA (asset-007) | 5.1% | $48 | 3.1x |
| Display Retargeting (asset-010) | 1.8% | $85 | 1.8x |

### Recommendation
Reallocate 30% of display retargeting budget ($350/day → $245/day) to search RSAs, specifically asset-006 which has the highest efficiency.

### Expected Impact
- Additional 8-12 leads per week
- CPL reduction of ~15% at campaign level
- ROAS improvement from 3.2x to estimated 3.8x`,
    confidence: 0.85,
    impactLevel: "high",
    actionItems: [
      "Reduce display retargeting daily budget by 30%",
      "Increase asset-006 budget allocation",
      "Monitor for 7 days and reassess",
    ],
    generatedContent: null,
    createdAt: "2026-02-17T11:00:00Z",
  },
  {
    id: "insight-005",
    orgId: null,
    type: "generation",
    assetId: "asset-002",
    campaignId: "camp-001",
    title: "Generated Replacement: ROI Calculator Carousel",
    summary: "AI-generated carousel concept to replace the fatigued ROI Calculator single image ad.",
    details: `## New Creative Concept: Interactive ROI Carousel

Replacing the fatigued single-image ROI Calculator ad with a carousel that tells a story.

### Concept
5-slide carousel that walks the viewer through a CPL calculation, with each slide revealing a hidden cost most marketers miss.`,
    confidence: 0.78,
    impactLevel: "medium",
    actionItems: [
      "Review generated copy",
      "Brief design team on carousel layout",
      "A/B test against current creative",
    ],
    generatedContent: `**Slide 1 — Hook**
"You think your CPL is $45. It's actually $127."
[Bold stat with red highlight, calculator icon]

**Slide 2 — Hidden Cost #1**
"Creative production: You're spending $2,400/month on assets that fatigue in 14 days"
[Icon: clock + money]

**Slide 3 — Hidden Cost #2**
"Audience overlap: 34% of your impressions are hitting the same people across campaigns"
[Icon: Venn diagram]

**Slide 4 — Hidden Cost #3**
"Manual optimization: Your team spends 12 hours/week on changes an AI could make in seconds"
[Icon: person at desk vs robot]

**Slide 5 — CTA**
"Calculate your REAL CPL — it takes 60 seconds"
[CTA button: "Get Your True CPL" → rampright.io/roi-calc]`,
    createdAt: "2026-02-16T15:00:00Z",
  },
  {
    id: "insight-006",
    orgId: null,
    type: "diagnosis",
    assetId: "asset-010",
    campaignId: "camp-002",
    title: "Display Retargeting Performance Declining",
    summary: "Retargeting banner CTR has dropped 45% — audience pool may be exhausted.",
    details: `## Retargeting Banner Performance Analysis

**Current CTR:** 0.12% (down from 0.22%)
**Frequency:** 8.3x average over 30 days

### Issue
The retargeting audience pool is saturated. With only ~5,000 unique visitors per month and a 30-day cookie window, users are seeing these banners too frequently.

### Recommendations
1. Reduce retargeting window from 30 days to 14 days
2. Implement frequency cap of 3 impressions per user per week
3. Create fresh banner designs with new messaging angles`,
    confidence: 0.87,
    impactLevel: "medium",
    actionItems: [
      "Reduce retargeting window to 14 days",
      "Set frequency cap to 3/week",
      "Design 2 new banner variations",
    ],
    generatedContent: null,
    createdAt: "2026-02-18T08:00:00Z",
  },
];

// ─── Alerts ──────────────────────────────────────────────────────

export const seedAlerts: Alert[] = [
  {
    id: "alert-001",
    orgId: null,
    type: "fatigue",
    severity: "high",
    title: "Creative Fatigue: ROI Calculator Ad",
    message: "asset-002 CTR has dropped 62% in 21 days. Fatigue score: 82/100.",
    assetId: "asset-002",
    campaignId: "camp-001",
    createdAt: "2026-02-15T10:00:00Z",
    dismissed: false,
  },
  {
    id: "alert-002",
    orgId: null,
    type: "performance_drop",
    severity: "medium",
    title: "Display Retargeting CTR Declining",
    message: "asset-010 CTR dropped 45% over 30 days. Consider refreshing creatives.",
    assetId: "asset-010",
    campaignId: "camp-002",
    createdAt: "2026-02-18T08:00:00Z",
    dismissed: false,
  },
  {
    id: "alert-003",
    orgId: null,
    type: "budget_pacing",
    severity: "medium",
    title: "Campaign 1 Budget Pacing Ahead",
    message: "LinkedIn Lead Gen campaign has spent 66% of budget with 47% of time remaining.",
    assetId: null,
    campaignId: "camp-001",
    createdAt: "2026-02-17T09:00:00Z",
    dismissed: false,
  },
  {
    id: "alert-004",
    orgId: null,
    type: "opportunity",
    severity: "low",
    title: "Top Performer Opportunity",
    message: "asset-001 is generating leads at $28.50 CPL — 37% below campaign average. Consider scaling.",
    assetId: "asset-001",
    campaignId: "camp-001",
    createdAt: "2026-02-16T14:00:00Z",
    dismissed: false,
  },
  {
    id: "alert-005",
    orgId: null,
    type: "anomaly",
    severity: "low",
    title: "New Asset Showing Promise",
    message: "asset-009 (Competitor Comparison RSA) is trending above campaign average after 10 days.",
    assetId: "asset-009",
    campaignId: "camp-002",
    createdAt: "2026-02-19T10:00:00Z",
    dismissed: false,
  },
];

// ─── Automation Actions ─────────────────────────────────────────

export const seedAutoActions: AutoAction[] = [
  {
    id: "auto-001",
    orgId: null,
    type: "pause_fatigued",
    targetType: "asset",
    targetId: "asset-002",
    description:
      'Auto-paused "LinkedIn Single Image — ROI Calculator Promo" due to fatigue score of 82.',
    status: "executed",
    triggeredBy: "pause_fatigued",
    metadata: { fatigueScore: 82, previousStatus: "active" },
    createdAt: "2026-02-15T10:05:00Z",
    executedAt: "2026-02-15T10:05:00Z",
  },
  {
    id: "auto-002",
    orgId: null,
    type: "reallocate_budget",
    targetType: "campaign",
    targetId: "camp-001",
    description:
      'Budget overpacing on "LinkedIn B2B Lead Gen — Q1 2026": spent 66% with 47% of time elapsed (30% over pace).',
    status: "pending",
    triggeredBy: "reallocate_budget",
    metadata: { spentFraction: 0.66, elapsedFraction: 0.47, overpacePercent: 40 },
    createdAt: "2026-02-17T09:10:00Z",
    executedAt: null,
  },
  {
    id: "auto-003",
    orgId: null,
    type: "suggest_creative_rotation",
    targetType: "asset",
    targetId: "asset-010",
    description:
      'Suggest creative rotation for "Google Display — Retargeting Banner Set": declining CTR with fatigue score 58.',
    status: "pending",
    triggeredBy: "suggest_creative_rotation",
    metadata: { fatigueScore: 58, trendDirection: "down" },
    createdAt: "2026-02-18T08:15:00Z",
    executedAt: null,
  },
  {
    id: "auto-004",
    orgId: null,
    type: "escalate_alert",
    targetType: "asset",
    targetId: "asset-002",
    description:
      'Alert "Creative Fatigue: ROI Calculator Ad" has been active for over 48 hours without dismissal.',
    status: "rejected",
    triggeredBy: "escalate_alert",
    metadata: { alertId: "alert-001", alertAge: 72 },
    createdAt: "2026-02-18T10:00:00Z",
    executedAt: null,
  },
  {
    id: "auto-005",
    orgId: null,
    type: "pause_fatigued",
    targetType: "asset",
    targetId: "asset-010",
    description:
      'Review suggested: pause "Google Display — Retargeting Banner Set" with fatigue score of 65.',
    status: "pending",
    triggeredBy: "pause_fatigued",
    metadata: { fatigueScore: 65 },
    createdAt: "2026-02-19T08:00:00Z",
    executedAt: null,
  },
];
