export const CASE_STUDIES = [
  {
    date: "2026-06-01",
    dayType: "MISCLASSIFIED_C",
    actualDayType: "A",
    primaryCatalyst: "ISM Manufacturing PMI",
    consensusExpected: 52.6,
    actualPrint: 54.0,
    beatMiss: +1.4,
    nqMoveFirstHour: "+200 pts",
    nqMoveFullSession: "+300 pts",
    entryZone: "30,365",
    optimalEntry: "9:30 AM CT post-ISM VWAP reclaim",
    lesson: "ISM beat >1.0 pts = A-day. Two PMI beats same morning = confluence. Never C-day when ISM beats by >1.0 pts.",
    confluenceFactors: [
      "ISM 54.0 vs 52.6 consensus (+1.4 beat)",
      "S&P Global PMI 55.1 also beat",
      "Oil declining on Iran ceasefire talks",
      "Markets at all-time highs (Nasdaq +8% May)",
      "Dell +32% AI infrastructure demand"
    ]
  }
]
