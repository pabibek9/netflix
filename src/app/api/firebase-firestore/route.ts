import { NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const { action, serviceAccount, collectionName, docId, data } = await req.json();

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
        })
      }, appName);
    }

    const db = getFirestore(app);

    // List all root collections in the database
    if (action === "listCollections") {
      const collections = await db.listCollections();
      const colNames = collections.map(c => c.id);
      
      // For each collection, fetch first 50 documents
      const payload = [];
      for (const name of colNames) {
        const snap = await db.collection(name).limit(50).get();
        const documents = snap.docs.map(doc => ({
          id: doc.id,
          data: doc.data(),
          createdAt: doc.createTime?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: doc.updateTime?.toDate().toISOString() || new Date().toISOString()
        }));
        payload.push({
          name,
          documents
        });
      }
      
      return NextResponse.json({ collections: payload });
    }

    // Write a document
    if (action === "setDocument") {
      if (!collectionName || !docId) {
        return NextResponse.json({ error: "Missing collectionName or docId" }, { status: 400 });
      }
      await db.collection(collectionName).doc(docId).set(data || {}, { merge: true });
      return NextResponse.json({ success: true });
    }

    // Delete a document
    if (action === "deleteDocument") {
      if (!collectionName || !docId) {
        return NextResponse.json({ error: "Missing collectionName or docId" }, { status: 400 });
      }
      await db.collection(collectionName).doc(docId).delete();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
