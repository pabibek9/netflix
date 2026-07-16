const fs = require("fs");
const path = require("path");

try {
  const keys = {};
  const rootDir = "D:\\goofy-curie";

  const targets = [
    { id: "auditbusiness-6ac2e", dirName: "linkedin analizer" },
    { id: "analyzer-a7b76", dirName: "business anilizer" },
    { id: "astra-e1afa", dirName: "astra" },
    { id: "diceblue-20f13", dirName: "bluedice admin" }
  ];

  for (const target of targets) {
    let foundKey = false;
    let source = "";

    // 1. Try checking the root folder first
    try {
      const rootFiles = fs.readdirSync(rootDir);
      const matchedFile = rootFiles.find(f => f.startsWith(target.id) && f.endsWith(".json"));
      if (matchedFile) {
        const content = fs.readFileSync(path.join(rootDir, matchedFile), "utf-8");
        const parsed = JSON.parse(content);
        keys[target.id] = parsed.project_id;
        foundKey = true;
        source = `root file: "${matchedFile}"`;
      }
    } catch (e) {}

    // 2. Fallback: Try checking the project subfolder
    if (!foundKey) {
      const dirPath = path.join(rootDir, target.dirName);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        const jsonFile = files.find(f => f.endsWith(".json"));
        if (jsonFile) {
          const content = fs.readFileSync(path.join(dirPath, jsonFile), "utf-8");
          const parsed = JSON.parse(content);
          keys[target.id] = parsed.project_id;
          foundKey = true;
          source = `subfolder file: "${target.dirName}/${jsonFile}"`;
        }
      }
    }

    if (foundKey) {
      console.log(`Matched project ID ${target.id} using key from ${source}`);
    } else {
      console.log(`No credentials key file found for project ${target.id}`);
    }
  }
} catch (e) {
  console.error("Error executing key test: ", e);
}
