const classifyIssue = (description) => {
  const text = description.toLowerCase();

  if (text.includes("pothole") || text.includes("road") || text.includes("crater")) {
    return { category: "pothole", severity: 8 };
  }

  if (text.includes("garbage") || text.includes("waste") || text.includes("trash")) {
    return { category: "garbage", severity: 6 };
  }

  if (text.includes("light") || text.includes("streetlight") || text.includes("street lamp")) {
    return { category: "streetlight", severity: 5 };
  }

  if (text.includes("water") || text.includes("leak") || text.includes("flooding")) {
    return { category: "water", severity: 7 };
  }

  if (text.includes("parking") || text.includes("parked")) {
    return { category: "parking", severity: 4 };
  }

  if (text.includes("dumping") || text.includes("illegal dump")) {
    return { category: "dumping", severity: 6 };
  }

  return { category: "other", severity: 3 };
};

module.exports = classifyIssue;