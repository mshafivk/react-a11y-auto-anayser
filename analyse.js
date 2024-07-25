const fs = require("fs");
const puppeteer = require("puppeteer");
const axeCore = require("axe-core");

async function analyzeAccessibility(url) {
  const browser = await puppeteer.launch({
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // Path to your installed Chrome
    headless: true,
  });
  const page = await browser.newPage();

  await page.goto(url);

  // Inject axe-core library into the page
  await page.addScriptTag({ content: axeCore.source });
  // Run axe-core
  const results = await page.evaluate(async () => {
    return await axe.run();
  });

  await browser.close();
  return results;
}

function generateHtmlReport(results) {
  let htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>A11y Report</title>
    <style>
      body { font-family: Arial, sans-serif; }
      .issue { margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; }
      .issue h2 { margin: 0; font-size: 18px; color: #d9534f; }
      .issue p { margin: 5px 0; }
    </style>
  </head>
  <body>
    <h1>Accessibility Report</h1>
  `;

  results.violations.forEach((violation) => {
    htmlContent += `
    <div class="issue">
      <h2>${violation.help}</h2>
      <p>${violation.description}</p>
      <ul>
    `;
    violation.nodes.forEach((node) => {
      htmlContent += `
        <li>
          <p>Target: ${node.target.join(", ")}</p>
          <p>HTML: ${node.html}</p>
          <p>Failure Summary: ${node.failureSummary}</p>
        </li>
      `;
    });
    htmlContent += `
      </ul>
    </div>
    `;
  });

  htmlContent += `
  </body>
  </html>
  `;

  fs.writeFileSync("a11y-report.html", htmlContent, "utf-8");
}

(async () => {
  const url = "http://localhost:4000/register"; // Replace with your React app's URL
  const results = await analyzeAccessibility(url);
  generateHtmlReport(results);
  console.log("Accessibility report generated: a11y-report.html");
})();
