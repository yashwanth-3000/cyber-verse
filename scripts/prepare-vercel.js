const fs = require('fs');
const path = require('path');

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Function to verify and create a placeholder routes-manifest.json if needed
function ensureRoutesManifest() {
  const nextDir = path.join(process.cwd(), '.next');
  const routesManifestPath = path.join(nextDir, 'routes-manifest.json');
  
  ensureDirectoryExists(nextDir);
  
  // Check if routes-manifest.json exists
  if (!fs.existsSync(routesManifestPath)) {
    console.log('routes-manifest.json not found, creating a minimal version...');
    
    // Create a basic routes-manifest.json with essential properties
    const minimalRoutesManifest = {
      version: 3,
      pages404: true,
      basePath: "",
      redirects: [],
      headers: [],
      dynamicRoutes: [],
      staticRoutes: [],
      dataRoutes: [],
      rewrites: []
    };
    
    fs.writeFileSync(
      routesManifestPath,
      JSON.stringify(minimalRoutesManifest, null, 2)
    );
    
    console.log('Created minimal routes-manifest.json file');
  } else {
    console.log('routes-manifest.json already exists, skipping creation');
  }
}

// Execute the function
ensureRoutesManifest(); 