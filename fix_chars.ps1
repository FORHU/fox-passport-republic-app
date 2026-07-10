const fs = require("fs");
const path = require("path");

const f = path.join(process.cwd(), "src/features/booking/components/BookingConfigurationClient.tsx");
let t = fs.readFileSync(f, "utf8");

// Fix broken lines
const fixes = [
  [ /isLoadingTemplate \? '?' : \`\${peso}\`/g, "isLoadingTemplate ? '…' : `?${basePrice.toLocaleString()}`" ],
  [ /isLoadingTemplate \? '?' : \`\${peso}\`/g, "isLoadingTemplate ? '…' : `?${totalAmount.toLocaleString()}`" ],
  [ /' – '/g, "' — '" ],
  [ /already booked ? shown/g, "already booked — shown" ],
  [ /Funds are secured ? the/g, "Funds are secured — the" ],
  [ /© 2024 FoxPassport/g, "© 2024 FoxPassport" ],
  [ /Loading…/g, "Loading…" ],  // ensure ellipsis
  [ /Creating booking\./g, "Creating booking…" ],
];

// Replace each, but only the first match for the peso lines (need unique patterns)
let lineIdx = 1;
const lines = t.split("\n");
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("basePrice.toLocaleString") && !lines[i].includes("?")) {
    lines[i] = lines[i].replace(/\${peso}/, "?");
  }
  if (lines[i].includes("totalAmount.toLocaleString") && !lines[i].includes("?")) {
    lines[i] = lines[i].replace(/\${peso}/, "?");
  }
  // Fix ellipsis in loading state
  if (lines[i].includes("isLoadingTemplate ? '") && lines[i].includes("' :")) {
    lines[i] = lines[i].replace(/'?'/, "'…'");
  }
}
t = lines.join("\n");

// Fix remaining corrupted characters
t = t.replace(/\ufffd/g, "…");
t = t.replace(/\${peso}/g, "");

fs.writeFileSync(f, t, "utf8");
console.log("Done");
console.log("File size:", t.length);
