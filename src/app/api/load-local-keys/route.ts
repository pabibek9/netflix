import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const keys: Record<string, string> = {};
    const rootDir = process.cwd(); // Matches workspace path: D:\goofy-curie

    const targets = [
      { id: "auditbusiness-6ac2e", dirName: "linkedin analizer" },
      { id: "analyzer-a7b76", dirName: "business anilizer" },
      { id: "astra-e1afa", dirName: "astra" },
      { id: "diceblue-20f13", dirName: "bluedice admin" }
    ];

    for (const target of targets) {
      let foundKey = false;
      
      // 1. Try checking the root folder first (highly recommended for new key updates!)
      try {
        const rootFiles = fs.readdirSync(rootDir);
        const matchedFile = rootFiles.find(f => f.startsWith(target.id) && f.endsWith(".json"));
        if (matchedFile) {
          const content = fs.readFileSync(path.join(/*turbopackIgnore: true*/ rootDir, matchedFile), "utf-8");
          keys[target.id] = content.trim();
          foundKey = true;
        }
      } catch (e) {
        // ignore root directory read errors
      }

      // 2. Fallback: Try checking the project subfolder
      if (!foundKey) {
        const dirPath = path.join(/*turbopackIgnore: true*/ rootDir, target.dirName);
        if (fs.existsSync(dirPath)) {
          const files = fs.readdirSync(dirPath);
          const jsonFile = files.find(f => f.endsWith(".json"));
          if (jsonFile) {
            const content = fs.readFileSync(path.join(/*turbopackIgnore: true*/ dirPath, jsonFile), "utf-8");
            keys[target.id] = content.trim();
          }
        }
      }
    }

    return NextResponse.json({ keys });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
