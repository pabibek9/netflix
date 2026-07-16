import { NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

export async function POST(req: Request) {
  try {
    const { action, serviceAccount, uid, claims, disabled } = await req.json();

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
      // Fix private key formatting for Windows environments
      const formattedKey = sa.private_key.replace(/\\n/g, "\n");
      app = initializeApp({
        credential: cert({
          ...sa,
          privateKey: formattedKey
        })
      }, appName);
    }

    const auth = getAuth(app);

    if (action === "list") {
      const listRes = await auth.listUsers(50);
      const mapped = listRes.users.map(u => ({
        uid: u.uid,
        email: u.email || "",
        displayName: u.displayName || u.email?.split("@")[0] || "Anonymous User",
        avatarUrl: u.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.uid}`,
        provider: u.providerData[0]?.providerId || "password",
        emailVerified: u.emailVerified,
        role: (u.customClaims?.role as any) || "Viewer",
        createdAt: new Date(u.metadata.creationTime).toISOString(),
        lastLogin: new Date(u.metadata.lastSignInTime).toISOString(),
        lastActive: new Date(u.metadata.lastSignInTime).toISOString(),
        status: u.disabled ? "disabled" : "active",
        customClaims: u.customClaims || {},
        device: "Web Browser",
        country: "Unknown",
        platform: "Web"
      }));
      return NextResponse.json({ users: mapped });
    }

    if (action === "updateRole") {
      await auth.setCustomUserClaims(uid, claims);
      return NextResponse.json({ success: true });
    }

    if (action === "updateStatus") {
      await auth.updateUser(uid, { disabled });
      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      await auth.deleteUser(uid);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
