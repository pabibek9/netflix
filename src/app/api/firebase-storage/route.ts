import { NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

export async function POST(req: Request) {
  try {
    const { action, serviceAccount, path } = await req.json();

    if (!serviceAccount) {
      return NextResponse.json({ error: "Missing Service Account payload" }, { status: 400 });
    }

    let sa: any;
    try {
      sa = JSON.parse(serviceAccount);
    } catch (e) {
      return NextResponse.json({ error: "Service Account is not valid JSON" }, { status: 400 });
    }

    if (!sa.project_id || !sa.private_key) {
      return NextResponse.json({ error: "Invalid Service Account credentials format" }, { status: 400 });
    }

    // Initialize admin app if not already
    const appName = sa.project_id;
    let app: any;
    
    const apps = getApps();
    const existing = apps.find(a => a.name === appName);
    if (existing) {
      app = existing;
    } else {
      const formattedKey = sa.private_key.replace(/\\n/g, "\n");
      app = initializeApp({
        credential: cert({
          ...sa,
          privateKey: formattedKey
        }),
        storageBucket: `${sa.project_id}.appspot.com`
      }, appName);
    }

    const bucket = getStorage(app).bucket();

    if (action === "listFiles") {
      const [files] = await bucket.getFiles({ prefix: path || "" });
      const mapped = files.map(f => {
        const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(f.name)}?alt=media`;
        const ext = f.name.split(".").pop()?.toLowerCase();
        let type = "document";
        if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext || "")) type = "image";
        else if (["mp4", "webm", "ogg", "mov"].includes(ext || "")) type = "video";
        else if (ext === "pdf") type = "pdf";

        return {
          name: f.name.split("/").pop() || f.name,
          path: f.name,
          size: `${Math.round(parseInt(String(f.metadata.size || "0")) / 1024)} KB`,
          type,
          url,
          updatedAt: f.metadata.updated ? String(f.metadata.updated) : new Date().toISOString()
        };
      });
      
      return NextResponse.json({ files: mapped });
    }

    if (action === "deleteFile") {
      if (!path) {
        return NextResponse.json({ error: "Missing file path" }, { status: 400 });
      }
      await bucket.file(path).delete();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
