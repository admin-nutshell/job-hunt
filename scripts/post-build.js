const fs = require('fs');
const path = require('path');

const routesJson = {
  "version": 1,
  "include": ["/*"],
  "exclude": []
};

fs.writeFileSync(
  path.join('.open-next', '_routes.json'),
  JSON.stringify(routesJson, null, 2)
);

console.log('Created _routes.json in .open-next');
