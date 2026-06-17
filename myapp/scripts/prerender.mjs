import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");
const templatePath = path.join(distDir, "index.html");
const srcAssetsDir = path.join(projectRoot, "src", "assets");
const distAssetsDir = path.join(distDir, "assets");

const publicRoutes = [
  "/",
  "/contact",
  "/privacy-policy",
  "/terms-of-use",
  "/pf/portfolio_intelligence",
  "/pf/portfolio_intelligence/snapshot",
  "/pf/portfolio_intelligence/performancedrivers",
  "/pf/portfolio_intelligence/revenue_leases",
  "/pf/portfolio_intelligence/expense_intel",
  "/pf/portfolio_intelligence/risk_stability",
  "/pf/property_intelligence",
  "/pf/ai_rent_intelligence",
  "/pf/market_radar",
  "/pf/deal_lens",
];
const baseUrl = "https://asset72.ghills.ai";
const routeMeta = {
  "/": {
    title: "The Operating System for Real Estate Investments | Asset72",
    description:
      "AI-powered real estate portfolio analytics to analyze NOI, rent rolls, T12s, occupancy, and risk signals. Make faster, data-driven investment decisions.",
  },
  "/contact": {
    title: "Contact Asset72 | Golden Hills",
    description:
      "Contact the Golden Hills team for an Asset72 demo, platform access, or partnership questions. Response within one business day.",
  },
  "/privacy-policy": {
    title: "Privacy Policy | Asset72",
    description:
      "Read the Asset72 privacy policy to understand how platform data, uploaded documents, and user information are handled.",
  },
  "/terms-of-use": {
    title: "Terms of Use | Asset72",
    description:
      "Review the Asset72 terms of use for platform access, acceptable usage, uploaded document handling, and service conditions.",
  },
  "/pf/portfolio_intelligence": {
    title: "Portfolio Intelligence | Asset72",
    description:
      "Aggregate asset-level data into portfolio-wide risk and allocation visibility. Track NOI, occupancy, and performance across your entire real estate portfolio.",
  },
  "/pf/portfolio_intelligence/snapshot": {
    title: "Portfolio Snapshot | Asset72",
    description:
      "View a portfolio-level operating snapshot across scale, profitability, revenue momentum, expense pressure, occupancy, and risk signals.",
  },
  "/pf/portfolio_intelligence/performancedrivers": {
    title: "Portfolio Performance Drivers | Asset72",
    description:
      "Analyze the revenue, expense, and NOI drivers behind portfolio performance with Asset72 portfolio intelligence.",
  },
  "/pf/portfolio_intelligence/revenue_leases": {
    title: "Portfolio Revenue and Lease Intelligence | Asset72",
    description:
      "Track revenue quality, lease rollover, occupancy trends, and lease exposure across a real estate portfolio.",
  },
  "/pf/portfolio_intelligence/expense_intel": {
    title: "Portfolio Expense Intel | Asset72",
    description:
      "Monitor expense pressure, operating expense ratios, and controllable cost signals across portfolio assets.",
  },
  "/pf/portfolio_intelligence/risk_stability": {
    title: "Portfolio Risk and Stability | Asset72",
    description:
      "Evaluate portfolio stability, risk concentration, occupancy exposure, and operating resilience signals.",
  },
  "/pf/property_intelligence": {
    title: "Property Intelligence | Asset72",
    description:
      "Monitor leasing performance, revenue quality, expense drift, and occupancy trends at the asset level with always-on property intelligence.",
  },
  "/pf/ai_rent_intelligence": {
    title: "AI Rent Intelligence | Asset72",
    description:
      "AI rent analysis that surfaces below-market pricing and revenue exposure across unit types from your rent roll. Identify rent growth opportunities.",
  },
  "/pf/market_radar": {
    title: "Market Radar | Asset72",
    description:
      "Real-time competitive market intelligence around your assets - supply pipeline, rent trends, and market positioning signals for smarter decisions.",
  },
  "/pf/deal_lens": {
    title: "Deal Lens - Pre-Underwriting Intelligence | Asset72",
    description:
      "Screen real estate deals before full diligence. Asset72 Deal Lens analyzes lease rollover, in-place vs market rents, and occupancy risk from T12s and rent rolls.",
  },
};

async function collectFiles(directory, root = directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath, root)));
      continue;
    }

    files.push(path.relative(root, fullPath));
  }

  return files;
}

async function buildAssetMap() {
  const [sourceFiles, builtFiles] = await Promise.all([
    collectFiles(srcAssetsDir),
    fs.readdir(distAssetsDir),
  ]);

  const assetMap = new Map();

  for (const relativeSourcePath of sourceFiles) {
    const parsed = path.parse(relativeSourcePath);
    const builtFile = builtFiles.find(
      (candidate) =>
        candidate.startsWith(`${parsed.name}-`) && candidate.endsWith(parsed.ext),
    );

    if (!builtFile) continue;

    const sourcePath = `/src/assets/${relativeSourcePath.split(path.sep).join("/")}`;
    const builtPath = `/assets/${builtFile}`;

    assetMap.set(sourcePath, builtPath);
    assetMap.set(encodeURI(sourcePath), builtPath);
  }

  return assetMap;
}

function rewriteAssetPaths(html, assetMap) {
  let nextHtml = html;

  for (const [sourcePath, builtPath] of assetMap.entries()) {
    nextHtml = nextHtml.split(sourcePath).join(builtPath);
  }

  return nextHtml;
}

function rewriteRouteMeta(html, route) {
  const meta = routeMeta[route] ?? routeMeta["/"];
  const url = route === "/" ? `${baseUrl}/` : `${baseUrl}${route}`;

  return html
    .replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`)
    .replace(
      /<meta name="description"[\s\S]*?content=".*?"[\s\S]*?\/>/,
      `<meta name="description" content="${meta.description}" />`,
    )
    .replace(/<meta property="og:url"[\s\S]*?content=".*?"[\s\S]*?\/>/, `<meta property="og:url" content="${url}" />`)
    .replace(
      /<meta property="og:title"[\s\S]*?content=".*?"[\s\S]*?\/>/,
      `<meta property="og:title" content="${meta.title}" />`,
    )
    .replace(
      /<meta property="og:description"[\s\S]*?content=".*?"[\s\S]*?\/>/,
      `<meta property="og:description" content="${meta.description}" />`,
    )
    .replace(/<link rel="canonical"[\s\S]*?href=".*?"[\s\S]*?\/>/, `<link rel="canonical" href="${url}" />`)
    .replace(
      /<meta name="twitter:title"[\s\S]*?content=".*?"[\s\S]*?\/>/,
      `<meta name="twitter:title" content="${meta.title}" />`,
    )
    .replace(
      /<meta name="twitter:description"[\s\S]*?content=".*?"[\s\S]*?\/>/,
      `<meta name="twitter:description" content="${meta.description}" />`,
    );
}

async function renderRoute(App, StaticRouter, route, template, assetMap) {
  const appHtml = renderToString(
    React.createElement(
      StaticRouter,
      { location: route },
      React.createElement(App),
    ),
  );

  return rewriteRouteMeta(
    rewriteAssetPaths(
      template.replace(
        '<div id="root"></div>',
        `<div id="root">${appHtml}</div>`,
      ),
      assetMap,
    ),
    route,
  );
}

async function writeRoute(route, html) {
  const outputDir =
    route === "/"
      ? distDir
      : path.join(distDir, route.replace(/^\/+/, "").replace(/\/+/g, path.sep));

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, "index.html"), html, "utf8");
}

async function main() {
  const vite = await createServer({
    appType: "custom",
    configFile: path.join(projectRoot, "vite.config.ts"),
    root: projectRoot,
    server: { middlewareMode: true },
  });

  try {
    const template = await fs.readFile(templatePath, "utf8");
    const { default: App } = await vite.ssrLoadModule("/src/App.tsx");
    const { StaticRouter } = await vite.ssrLoadModule("react-router");
    const assetMap = await buildAssetMap();

    for (const route of publicRoutes) {
      const html = await renderRoute(App, StaticRouter, route, template, assetMap);
      await writeRoute(route, html);
    }
  } finally {
    await vite.close();
  }
}

main().catch((error) => {
  console.error("Prerender failed", error);
  process.exitCode = 1;
});
