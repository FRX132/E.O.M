const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/female_anatomy.json', 'utf8'));

let minX = Infinity, maxX = -Infinity;
let minY = Infinity, maxY = -Infinity;

data.back.forEach(m => {
  Object.values(m.path).flat().forEach(p => {
    const match = p.match(/m\s+([0-9.-]+),([0-9.-]+)/i);
    if (match) {
      const x = parseFloat(match[1]);
      const y = parseFloat(match[2]);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  });
});

console.log('Min X:', minX, 'Max X:', maxX);
console.log('Min Y:', minY, 'Max Y:', maxY);
