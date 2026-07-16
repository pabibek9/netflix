"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, limit } from "firebase/firestore";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";

// Types definition
export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
  databaseURL?: string;
}

export interface FirebaseProject {
  id: string;
  name: string;
  description: string;
  firebaseConfig?: FirebaseConfig;
  serviceAccount?: string; // JSON string
  environment: "production" | "development";
  status: "online" | "offline";
  usersCount: number;
  storageUsed: string; // e.g., "142.8 GB"
  databaseSize: string; // e.g., "1.2 GB"
  logo: string; // SVG or color class name
}

export interface MockUser {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  provider: "google.com" | "password" | "anonymous" | "phone";
  emailVerified: boolean;
  role: "Owner" | "Admin" | "Moderator" | "Support" | "Viewer";
  createdAt: string;
  lastLogin: string;
  lastActive: string;
  status: "active" | "inactive" | "disabled" | "banned";
  customClaims: Record<string, any>;
  device: string;
  country: string;
  platform: string;
  rawDoc?: Record<string, any>;
}

export interface MockDocument {
  id: string;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface MockCollection {
  name: string;
  documents: MockDocument[];
}

export interface MockStorageFile {
  name: string;
  path: string;
  size: string;
  type: "image" | "video" | "pdf" | "document" | "folder";
  url: string;
  updatedAt: string;
}

export interface MockAuditLog {
  id: string;
  timestamp: string;
  action: string;
  userEmail: string;
  userRole: string;
  details: string;
  projectId: string;
}

export interface MockNotification {
  id: string;
  type: "push" | "email";
  target: "all" | "vip" | "single" | "segment";
  targetUser?: string;
  segment?: string;
  title: string;
  body: string;
  scheduledFor?: string;
  sentAt?: string;
  status: "sent" | "scheduled" | "failed";
}

interface ProjectContextType {
  projects: FirebaseProject[];
  currentProjectId: string;
  currentProject: FirebaseProject | undefined;
  users: MockUser[];
  collections: MockCollection[];
  storageFiles: MockStorageFile[];
  auditLogs: MockAuditLog[];
  notifications: MockNotification[];
  systemStatus: {
    firestoreStatus: "operational" | "degraded" | "down";
    authStatus: "operational" | "degraded" | "down";
    storageStatus: "operational" | "degraded" | "down";
    functionsStatus: "operational" | "degraded" | "down";
  };
  liveActive: boolean;
  syncError: string;
  projectUsers: Record<string, MockUser[]>;
  
  // Project operations
  setCurrentProjectId: (id: string) => void;
  addProject: (project: FirebaseProject) => void;
  updateProject: (id: string, updates: Partial<FirebaseProject>) => void;
  deleteProject: (id: string) => void;

  // User operations
  addUser: (user: Omit<MockUser, "uid" | "createdAt" | "lastLogin" | "lastActive">) => void;
  updateUser: (uid: string, updates: Partial<MockUser>) => void;
  deleteUser: (uid: string) => void;
  bulkUpdateRole: (uids: string[], role: MockUser["role"]) => void;
  bulkDeleteUsers: (uids: string[]) => void;
  
  // Firestore operations
  addCollection: (name: string) => void;
  deleteCollection: (name: string) => void;
  addDocument: (collectionName: string, docId: string, data: Record<string, any>) => void;
  updateDocument: (collectionName: string, docId: string, data: Record<string, any>) => void;
  deleteDocument: (collectionName: string, docId: string) => void;

  // Storage operations
  uploadFile: (file: Omit<MockStorageFile, "updatedAt" | "url">) => void;
  deleteFile: (path: string) => void;

  // Notification operations
  sendNewNotification: (notification: Omit<MockNotification, "id" | "status" | "sentAt">) => void;
  
  // Audit logs
  logAction: (action: string, details: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Core initial project configs
const initialProjects: FirebaseProject[] = [
  {
    id: "auditbusiness-6ac2e",
    name: "LinkedIn Analyzer",
    description: "Professional social media analytics, audience engagement metrics, and business intelligence portal.",
    environment: "production",
    status: "online",
    usersCount: 0,
    storageUsed: "0 B",
    databaseSize: "0 B",
    logo: "bg-blue-600 text-white",
    firebaseConfig: {
      apiKey: "AIzaSyClXr6JLPPcHiyRSYitKEX1IqBrU_RxZ60",
      authDomain: "auditbusiness-6ac2e.firebaseapp.com",
      databaseURL: "https://auditbusiness-6ac2e-default-rtdb.firebaseio.com",
      projectId: "auditbusiness-6ac2e",
      storageBucket: "auditbusiness-6ac2e.firebasestorage.app",
      messagingSenderId: "1014636004294",
      appId: "1:1014636004294:web:dd1edd5a525182530228c7",
      measurementId: "G-FVJTGY8G9S"
    }
  },
  {
    id: "analyzer-a7b76",
    name: "Business Analyzer",
    description: "Enterprise analytics compiler, operational database, and transactional logs repository.",
    environment: "production",
    status: "online",
    usersCount: 0,
    storageUsed: "0 B",
    databaseSize: "0 B",
    logo: "bg-indigo-600 text-white",
    firebaseConfig: {
      apiKey: "AIzaSyDeeqCYcMTIy_KX5L_EAV4WyiPTQONXDvg",
      authDomain: "analyzer-a7b76.firebaseapp.com",
      projectId: "analyzer-a7b76",
      storageBucket: "analyzer-a7b76.firebasestorage.app",
      messagingSenderId: "175067638117",
      appId: "1:175067638117:web:ba5101f2314a31433c998c",
      measurementId: "G-E3MRS6K4W1"
    }
  },
  {
    id: "astra-e1afa",
    name: "Astra",
    description: "Core cloud infrastructure event manager, telemetry database, and monitoring logs hub.",
    environment: "production",
    status: "online",
    usersCount: 0,
    storageUsed: "0 B",
    databaseSize: "0 B",
    logo: "bg-violet-600 text-white",
    firebaseConfig: {
      apiKey: "AIzaSyAZ1E9hlQJMNr6wyaRlMk389jx8T0DyQ-s",
      authDomain: "astra-e1afa.firebaseapp.com",
      projectId: "astra-e1afa",
      storageBucket: "astra-e1afa.firebasestorage.app",
      messagingSenderId: "687034652568",
      appId: "1:687034652568:web:830430f26f58163b3a3ded",
      measurementId: "G-HGPGG2DTQX"
    }
  },
  {
    id: "n8n---content-creation",
    name: "Louis Smart",
    description: "n8n automation bindings, workflow monitors, and dynamic content assets repository.",
    environment: "production",
    status: "online",
    usersCount: 0,
    storageUsed: "0 B",
    databaseSize: "0 B",
    logo: "bg-emerald-650 text-white",
    firebaseConfig: {
      apiKey: "AIzaSyASJ4RySHIGlG43U_Xm0gnIems32gpgEuo",
      authDomain: "n8n---content-creation.firebaseapp.com",
      projectId: "n8n---content-creation",
      storageBucket: "n8n---content-creation.firebasestorage.app",
      messagingSenderId: "923053914424",
      appId: "1:923053914424:web:980794a040c42c647529cd",
      measurementId: "G-12R0CME9GR"
    }
  },
  {
    id: "diceblue-20f13",
    name: "Blue Dice",
    description: "Gaming backend state engines, matchmaking relays, and developer testing grounds.",
    environment: "development",
    status: "online",
    usersCount: 0,
    storageUsed: "0 B",
    databaseSize: "0 B",
    logo: "bg-blue-800 text-white border border-blue-700",
    firebaseConfig: {
      apiKey: "AIzaSyDwVlnoCITjOe1y1rkh9dSRQOdGoAedEYM",
      authDomain: "diceblue-20f13.firebaseapp.com",
      projectId: "diceblue-20f13",
      storageBucket: "diceblue-20f13.firebasestorage.app",
      messagingSenderId: "589557189696",
      appId: "1:589557189696:web:a259aaac1f87c0a83ea3a5",
      measurementId: "G-Q3RX78431X"
    }
  }
];

// Helper to generate seed users for a project
const generateSeedUsers = (projectId: string): MockUser[] => {
  return [];
};

// Helper to generate seed Firestore collections and documents
const generateSeedFirestore = (projectId: string): MockCollection[] => {
  return [];
};

// Helper to generate seed Storage files
const generateSeedStorage = (projectId: string): MockStorageFile[] => {
  return [];
};

// Helper to generate seed Audit Logs
const generateSeedAuditLogs = (projectId: string): MockAuditLog[] => {
  return [
    {
      id: "log_1",
      timestamp: "2026-07-14T05:30:00Z",
      action: "Login",
      userEmail: "admin@controlcenter.co",
      userRole: "Owner",
      details: "Logged in successfully from device MacBook Pro M3 Max (USA)",
      projectId
    },
    {
      id: "log_2",
      timestamp: "2026-07-13T18:24:00Z",
      action: "Edit Firestore",
      userEmail: "support@controlcenter.co",
      userRole: "Support",
      details: "Updated document 'movie_wednesday' in collection 'movies'",
      projectId
    },
    {
      id: "log_3",
      timestamp: "2026-07-12T15:10:00Z",
      action: "Grant VIP",
      userEmail: "admin@controlcenter.co",
      userRole: "Owner",
      details: "Granted custom claim 'tier = vip' to user alexander.w@example.com",
      projectId
    },
    {
      id: "log_4",
      timestamp: "2026-07-10T12:00:00Z",
      action: "Delete User",
      userEmail: "support@controlcenter.co",
      userRole: "Support",
      details: "Deleted user account uid netflix-prod-user-94",
      projectId
    }
  ];
};

// Helper to generate seed Notifications
const generateSeedNotifications = (): MockNotification[] => {
  return [
    {
      id: "notif_1",
      type: "push",
      target: "all",
      title: "New Releases Available",
      body: "We have just added 10 new blockbuster movies to the catalog. Check them out!",
      sentAt: "2026-07-12T18:00:00Z",
      status: "sent"
    },
    {
      id: "notif_2",
      type: "email",
      target: "vip",
      title: "VIP Account Renewed",
      body: "Thank you for being a premium subscriber. Your subscription has been auto-renewed.",
      sentAt: "2026-07-10T09:00:00Z",
      status: "sent"
    },
    {
      id: "notif_3",
      type: "push",
      target: "single",
      targetUser: "admin@controlcenter.co",
      title: "Security Warning",
      body: "New login detected on your admin console from a new browser session.",
      scheduledFor: "2026-07-16T12:00:00Z",
      status: "scheduled"
    }
  ];
};

const getFileTypeByName = (name: string): "image" | "video" | "pdf" | "document" => {
  const ext = name.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext || "")) return "image";
  if (["mp4", "webm", "ogg", "mov"].includes(ext || "")) return "video";
  if (ext === "pdf") return "pdf";
  return "document";
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<FirebaseProject[]>(initialProjects);
  const [currentProjectId, setCurrentProjectId] = useState<string>("auditbusiness-6ac2e");
  const [liveActive, setLiveActive] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string>("");
  
  // Dynamic collections/users databases per-project
  const [projectUsers, setProjectUsers] = useState<Record<string, MockUser[]>>({});
  const [projectCollections, setProjectCollections] = useState<Record<string, MockCollection[]>>({});
  const [projectStorage, setProjectStorage] = useState<Record<string, MockStorageFile[]>>({});
  const [projectAuditLogs, setProjectAuditLogs] = useState<Record<string, MockAuditLog[]>>({});
  
  // Shared global settings
  const [notifications, setNotifications] = useState<MockNotification[]>([]);
  
  // Mock Firebase infrastructure status
  const [systemStatus] = useState({
    firestoreStatus: "operational" as const,
    authStatus: "operational" as const,
    storageStatus: "operational" as const,
    functionsStatus: "operational" as const,
  });

  // Lazy seed loader
  useEffect(() => {
    // Generate templates for each project if they don't exist yet
    const seededUsers: Record<string, MockUser[]> = {};
    const seededCollections: Record<string, MockCollection[]> = {};
    const seededStorage: Record<string, MockStorageFile[]> = {};
    const seededLogs: Record<string, MockAuditLog[]> = {};

    projects.forEach(p => {
      seededUsers[p.id] = generateSeedUsers(p.id);
      seededCollections[p.id] = generateSeedFirestore(p.id);
      seededStorage[p.id] = generateSeedStorage(p.id);
      seededLogs[p.id] = generateSeedAuditLogs(p.id);
    });

    setProjectUsers(seededUsers);
    setProjectCollections(seededCollections);
    setProjectStorage(seededStorage);
    setProjectAuditLogs(seededLogs);
    setNotifications(generateSeedNotifications());
  }, [projects]);

  // Load local service accounts from filesystem on startup
  useEffect(() => {
    const loadKeys = async () => {
      try {
        const res = await fetch("/api/load-local-keys");
        const data = await res.json();
        if (data.keys) {
          setProjects(prev => prev.map(p => {
            if (data.keys[p.id]) {
              return { ...p, serviceAccount: data.keys[p.id] };
            }
            return p;
          }));
        }
      } catch (e) {
        console.error("Failed to load local keys: ", e);
      }
    };
    loadKeys();
  }, []);

  const colNamesString = (projectCollections[currentProjectId] || []).map(c => c.name).join(",");

  // Realtime Live Firebase Synchronization for all projects in parallel
  useEffect(() => {
    let active = true;
    
    const syncAll = async () => {
      for (const project of projects) {
        if (!project.firebaseConfig || !project.firebaseConfig.apiKey) continue;

        let hasDataConnection = false;

        // Try Admin SDK first if Service Account is loaded (highly recommended to bypass rules!)
        if (project.serviceAccount) {
          try {
            // 1. Fetch Firestore Collections & Documents
            const firestoreRes = await fetch("/api/firebase-firestore", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "listCollections",
                serviceAccount: project.serviceAccount
              })
            });
            const firestoreData = await firestoreRes.json();
            if (firestoreData.collections && active) {
              hasDataConnection = true;
              setProjectCollections(prev => ({
                ...prev,
                [project.id]: firestoreData.collections
              }));

              // Extract and map users from users/profiles collections
              const usersCol = firestoreData.collections.find((c: any) => ["users", "profiles", "accounts"].includes(c.name));
              if (usersCol && usersCol.documents.length > 0) {
                const fetchedUsers = usersCol.documents.map((docItem: any) => {
                  const userData = docItem.data || {};
                  return {
                    uid: docItem.id,
                    email: userData.email || "",
                    displayName: userData.displayName || userData.name || userData.username || docItem.id,
                    avatarUrl: userData.avatarUrl || userData.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${docItem.id}`,
                    provider: userData.provider || "password",
                    emailVerified: userData.emailVerified || false,
                    role: userData.role || "Viewer",
                    createdAt: userData.createdAt || docItem.createdAt,
                    lastLogin: userData.lastLogin || docItem.updatedAt,
                    lastActive: userData.lastActive || docItem.updatedAt,
                    status: userData.status || "active",
                    customClaims: userData.customClaims || {},
                    device: userData.device || "",
                    country: userData.country || "",
                    platform: userData.platform || "",
                    rawDoc: userData
                  };
                });
                setProjectUsers(prev => ({
                  ...prev,
                  [project.id]: fetchedUsers
                }));
              }
            }

            // 2. Fetch Storage Files
            const storageRes = await fetch("/api/firebase-storage", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "listFiles",
                serviceAccount: project.serviceAccount,
                path: ""
              })
            });
            const storageData = await storageRes.json();
            if (storageData.files && active) {
              setProjectStorage(prev => ({
                ...prev,
                [project.id]: storageData.files
              }));
            }

            // 3. Fetch Auth Accounts list
            const usersRes = await fetch("/api/firebase-users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "list",
                serviceAccount: project.serviceAccount
              })
            });
            const usersData = await usersRes.json();
            if (usersData.users && active) {
              setProjectUsers(prev => ({
                ...prev,
                [project.id]: usersData.users
              }));
            }

          } catch (e) {
            console.error("Admin SDK fetch error for project", project.id, e);
          }
        }

        // Try client-side Web SDK query if Admin SDK is not used or returned no collections
        if (!hasDataConnection) {
          try {
            const apps = getApps();
            let app = apps.find(a => a.name === project.id);
            if (!app) {
              app = initializeApp(project.firebaseConfig, project.id);
            }

            const db = getFirestore(app);

            const probeCollections = [
              "users", "profiles", "accounts", "analyses", "reports",
              "telemetry", "organizations", "workflows", "matches",
              "config", "settings", "posts", "analytics", "data", "history"
            ];
            
            const currentCols = projectCollections[project.id] || [];
            const allProbes = Array.from(new Set([...probeCollections, ...currentCols.map(c => c.name)]));

            const updatedCollections: MockCollection[] = [];
            for (const colName of allProbes) {
              try {
                const snap = await getDocs(query(collection(db, colName), limit(50)));
                if (!snap.empty || currentCols.some(c => c.name === colName)) {
                  const docs = snap.docs.map(d => ({
                    id: d.id,
                    data: d.data(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }));
                  updatedCollections.push({
                    name: colName,
                    documents: docs
                  });
                }
              } catch (e) {
                if (currentCols.some(c => c.name === colName)) {
                  const existingCol = currentCols.find(c => c.name === colName);
                  if (existingCol) updatedCollections.push(existingCol);
                }
              }
            }

            if (active && updatedCollections.length > 0) {
              hasDataConnection = true;
              setProjectCollections(prev => ({
                ...prev,
                [project.id]: updatedCollections
              }));
            }

            // Extract users from client Firestore
            const firestoreUsersCol = updatedCollections.find(c => ["users", "profiles", "accounts"].includes(c.name));
            if (firestoreUsersCol && firestoreUsersCol.documents.length > 0) {
              const fetchedUsers = firestoreUsersCol.documents.map((docItem) => {
                const data = docItem.data || {};
                return {
                  uid: docItem.id,
                  email: data.email || "",
                  displayName: data.displayName || data.name || data.username || docItem.id,
                  avatarUrl: data.avatarUrl || data.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${docItem.id}`,
                  provider: data.provider || "password",
                  emailVerified: data.emailVerified || false,
                  role: data.role || "Viewer",
                  createdAt: data.createdAt || docItem.createdAt,
                  lastLogin: data.lastLogin || docItem.updatedAt,
                  lastActive: data.lastActive || docItem.updatedAt,
                  status: data.status || "active",
                  customClaims: data.customClaims || {},
                  device: data.device || "",
                  country: data.country || "",
                  platform: data.platform || "",
                  rawDoc: data
                };
              });

              if (active) {
                setProjectUsers(prev => ({
                  ...prev,
                  [project.id]: fetchedUsers
                }));
              }
            }

            // Client-side Storage list
            try {
              const storage = getStorage(app);
              const rootRef = ref(storage);
              const listRes = await listAll(rootRef);
              
              const files: MockStorageFile[] = [];
              for (const item of listRes.items) {
                const url = await getDownloadURL(item);
                files.push({
                  name: item.name,
                  path: item.fullPath,
                  size: "1.2 MB",
                  type: getFileTypeByName(item.name),
                  url,
                  updatedAt: new Date().toISOString()
                });
              }
              
              for (const pref of listRes.prefixes) {
                const subRes = await listAll(pref);
                for (const item of subRes.items) {
                  const url = await getDownloadURL(item);
                  files.push({
                    name: item.name,
                    path: item.fullPath,
                    size: "350 KB",
                    type: getFileTypeByName(item.name),
                    url,
                    updatedAt: new Date().toISOString()
                  });
                }
              }

              if (active && files.length > 0) {
                setProjectStorage(prev => ({
                  ...prev,
                  [project.id]: files
                }));
              }
            } catch (e) {
              // ignore storage errors
            }

          } catch (err: any) {
            console.error("Client-side sync error for project", project.id, err);
            if (project.id === currentProjectId && active) {
              setLiveActive(false);
              setSyncError(err.message || "Permissions rules blocked Firestore query.");
            }
          }
        }

        // Set status metrics for active project in dashboard
        if (project.id === currentProjectId && active) {
          setLiveActive(hasDataConnection);
          setSyncError(hasDataConnection ? "" : "No database connection established. Check security rules or upload a Service Account JSON certificate in Settings.");
        }
      }
    };

    syncAll();

    return () => {
      active = false;
    };
  }, [projects, currentProjectId, colNamesString]);

  const collections = projectCollections[currentProjectId] || [];
  const storageFiles = projectStorage[currentProjectId] || [];
  const auditLogs = projectAuditLogs[currentProjectId] || [];

  const projectsList = useMemo(() => {
    return projects.map(p => {
      const realUsers = projectUsers[p.id] || [];
      const realCols = projectCollections[p.id] || [];
      const realFiles = projectStorage[p.id] || [];

      return {
        ...p,
        usersCount: realUsers.length > 0 ? realUsers.length : p.usersCount,
        databaseSize: realCols.length > 0 ? `${realCols.reduce((acc, c) => acc + c.documents.length, 0)} docs` : p.databaseSize,
        storageUsed: realFiles.length > 0 ? `${realFiles.length} files` : p.storageUsed,
      };
    });
  }, [projects, projectUsers, projectCollections, projectStorage]);

  const currentProject = useMemo(() => {
    const proj = projects.find(p => p.id === currentProjectId);
    if (!proj) return undefined;

    const realUsers = projectUsers[currentProjectId] || [];
    const realCols = projectCollections[currentProjectId] || [];
    const realFiles = projectStorage[currentProjectId] || [];

    return {
      ...proj,
      usersCount: liveActive && realUsers.length > 0 ? realUsers.length : proj.usersCount,
      databaseSize: liveActive && realCols.length > 0 ? `${realCols.reduce((acc, c) => acc + c.documents.length, 0)} docs` : proj.databaseSize,
      storageUsed: liveActive && realFiles.length > 0 ? `${realFiles.length} files` : proj.storageUsed,
    };
  }, [projects, currentProjectId, projectUsers, projectCollections, projectStorage, liveActive]);

  const users = useMemo(() => {
    return projectUsers[currentProjectId] || [];
  }, [projectUsers, currentProjectId]);

  // ----------------------------------------------------
  // Project Management Actions
  // ----------------------------------------------------
  
  const addProject = (project: FirebaseProject) => {
    setProjects(prev => [...prev, project]);
    
    // Seed initial mock databases for this new project
    setProjectUsers(prev => ({
      ...prev,
      [project.id]: generateSeedUsers(project.id)
    }));
    setProjectCollections(prev => ({
      ...prev,
      [project.id]: generateSeedFirestore(project.id)
    }));
    setProjectStorage(prev => ({
      ...prev,
      [project.id]: generateSeedStorage(project.id)
    }));
    setProjectAuditLogs(prev => ({
      ...prev,
      [project.id]: [
        {
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: "Initialize Project",
          userEmail: "admin@controlcenter.co",
          userRole: "Owner",
          details: `Firebase project config loaded dynamically into Dashboard`,
          projectId: project.id
        }
      ]
    }));
  };

  const updateProject = (id: string, updates: Partial<FirebaseProject>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (currentProjectId === id) {
      const remaining = projects.filter(p => p.id !== id);
      if (remaining.length > 0) {
        setCurrentProjectId(remaining[0].id);
      }
    }
  };

  // ----------------------------------------------------
  // Users Actions
  // ----------------------------------------------------

  const addUser = (newUser: Omit<MockUser, "uid" | "createdAt" | "lastLogin" | "lastActive">) => {
    const freshUser: MockUser = {
      ...newUser,
      uid: `${currentProjectId}-user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };
    
    setProjectUsers(prev => ({
      ...prev,
      [currentProjectId]: [freshUser, ...(prev[currentProjectId] || [])]
    }));

    logAction("Add User", `Created user account with UID ${freshUser.uid} (${freshUser.email})`);
  };

  const updateUser = async (uid: string, updates: Partial<MockUser>) => {
    setProjectUsers(prev => {
      const currentList = prev[currentProjectId] || [];
      const updatedList = currentList.map(u => u.uid === uid ? { ...u, ...updates, lastActive: new Date().toISOString() } : u);
      return {
        ...prev,
        [currentProjectId]: updatedList
      };
    });

    const user = users.find(u => u.uid === uid);
    if (user) {
      logAction("Update User", `Modified properties for ${user.displayName || user.email}`);
    }

    // Real Firebase Auth mutation
    if (currentProject?.serviceAccount) {
      try {
        if (updates.role) {
          await fetch("/api/firebase-users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "updateRole",
              serviceAccount: currentProject.serviceAccount,
              uid,
              claims: { role: updates.role.toLowerCase() }
            })
          });
        }
        if (updates.status) {
          await fetch("/api/firebase-users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "updateStatus",
              serviceAccount: currentProject.serviceAccount,
              uid,
              disabled: updates.status === "banned" || updates.status === "inactive"
            })
          });
        }
      } catch (e) {
        console.error("Live User mutation error: ", e);
      }
    }
  };

  const deleteUser = async (uid: string) => {
    const user = users.find(u => u.uid === uid);
    setProjectUsers(prev => ({
      ...prev,
      [currentProjectId]: (prev[currentProjectId] || []).filter(u => u.uid !== uid)
    }));

    if (user) {
      logAction("Delete User", `Permanently removed user account: ${user.email} (${uid})`);
    }

    // Real Firebase Auth mutation
    if (currentProject?.serviceAccount) {
      try {
        await fetch("/api/firebase-users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "delete",
            serviceAccount: currentProject.serviceAccount,
            uid
          })
        });
      } catch (e) {
        console.error("Live User delete error: ", e);
      }
    }
  };

  const bulkUpdateRole = (uids: string[], role: MockUser["role"]) => {
    setProjectUsers(prev => {
      const currentList = prev[currentProjectId] || [];
      const updatedList = currentList.map(u => 
        uids.includes(u.uid) 
          ? { ...u, role, customClaims: { ...u.customClaims, role: role.toLowerCase() }, lastActive: new Date().toISOString() } 
          : u
      );
      return { ...prev, [currentProjectId]: updatedList };
    });

    logAction("Bulk Change Role", `Changed roles to ${role} for ${uids.length} accounts`);
  };

  const bulkDeleteUsers = (uids: string[]) => {
    setProjectUsers(prev => ({
      ...prev,
      [currentProjectId]: (prev[currentProjectId] || []).filter(u => !uids.includes(u.uid))
    }));

    logAction("Bulk Delete", `Deleted ${uids.length} user accounts in a batch action`);
  };

  // ----------------------------------------------------
  // Firestore Explorer Actions
  // ----------------------------------------------------

  const addCollection = (name: string) => {
    setProjectCollections(prev => {
      const currentCols = prev[currentProjectId] || [];
      if (currentCols.some(c => c.name === name)) return prev; // Avoid duplicates
      
      const newCol: MockCollection = {
        name,
        documents: []
      };
      
      return {
        ...prev,
        [currentProjectId]: [...currentCols, newCol]
      };
    });

    logAction("Create Collection", `Created empty collection path: /${name}`);
  };

  const deleteCollection = (name: string) => {
    setProjectCollections(prev => ({
      ...prev,
      [currentProjectId]: (prev[currentProjectId] || []).filter(c => c.name !== name)
    }));

    logAction("Delete Collection", `Deleted entire collection path and nested fields: /${name}`);
  };

  const addDocument = async (collectionName: string, docId: string, data: Record<string, any>) => {
    setProjectCollections(prev => {
      const currentCols = prev[currentProjectId] || [];
      const updatedCols = currentCols.map(c => {
        if (c.name !== collectionName) return c;
        
        const newDoc: MockDocument = {
          id: docId || `doc_${Date.now()}`,
          data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return {
          ...c,
          documents: [newDoc, ...c.documents]
        };
      });

      return {
        ...prev,
        [currentProjectId]: updatedCols
      };
    });

    logAction("Create Document", `Created document /${collectionName}/${docId}`);

    // Live Firestore Mutation
    if (liveActive && currentProject) {
      try {
        const apps = getApps();
        const app = apps.find(a => a.name === currentProjectId) || initializeApp(currentProject.firebaseConfig!, currentProjectId);
        const db = getFirestore(app);
        await setDoc(doc(db, collectionName, docId || `doc_${Date.now()}`), data);
      } catch (e) {
        console.error("Live Firestore mutation error: ", e);
      }
    }
  };

  const updateDocument = async (collectionName: string, docId: string, data: Record<string, any>) => {
    setProjectCollections(prev => {
      const currentCols = prev[currentProjectId] || [];
      const updatedCols = currentCols.map(c => {
        if (c.name !== collectionName) return c;
        
        const updatedDocs = c.documents.map(d => {
          if (d.id !== docId) return d;
          return {
            ...d,
            data: { ...d.data, ...data },
            updatedAt: new Date().toISOString()
          };
        });
        
        return {
          ...c,
          documents: updatedDocs
        };
      });

      return {
        ...prev,
        [currentProjectId]: updatedCols
      };
    });

    logAction("Edit Firestore", `Updated fields for /${collectionName}/${docId}`);

    // Live Firestore Mutation
    if (liveActive && currentProject) {
      try {
        const apps = getApps();
        const app = apps.find(a => a.name === currentProjectId) || initializeApp(currentProject.firebaseConfig!, currentProjectId);
        const db = getFirestore(app);
        await setDoc(doc(db, collectionName, docId), data, { merge: true });
      } catch (e) {
        console.error("Live Firestore mutation error: ", e);
      }
    }
  };

  const deleteDocument = async (collectionName: string, docId: string) => {
    setProjectCollections(prev => {
      const currentCols = prev[currentProjectId] || [];
      const updatedCols = currentCols.map(c => {
        if (c.name !== collectionName) return c;
        return {
          ...c,
          documents: c.documents.filter(d => d.id !== docId)
        };
      });

      return {
        ...prev,
        [currentProjectId]: updatedCols
      };
    });

    logAction("Delete Firestore", `Permanently deleted /${collectionName}/${docId}`);

    // Live Firestore Mutation
    if (liveActive && currentProject) {
      try {
        const apps = getApps();
        const app = apps.find(a => a.name === currentProjectId) || initializeApp(currentProject.firebaseConfig!, currentProjectId);
        const db = getFirestore(app);
        await deleteDoc(doc(db, collectionName, docId));
      } catch (e) {
        console.error("Live Firestore mutation error: ", e);
      }
    }
  };

  // ----------------------------------------------------
  // Storage Actions
  // ----------------------------------------------------

  const uploadFile = (file: Omit<MockStorageFile, "updatedAt" | "url">) => {
    const fullFile: MockStorageFile = {
      ...file,
      url: file.type === "image" ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80" : "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      updatedAt: new Date().toISOString()
    };

    setProjectStorage(prev => ({
      ...prev,
      [currentProjectId]: [fullFile, ...(prev[currentProjectId] || [])]
    }));

    logAction("Upload Storage", `Uploaded file '${file.name}' to path: /${file.path}`);
  };

  const deleteFile = (path: string) => {
    setProjectStorage(prev => ({
      ...prev,
      [currentProjectId]: (prev[currentProjectId] || []).filter(f => f.path !== path)
    }));

    logAction("Delete Storage", `Removed object key: /${path}`);
  };

  // ----------------------------------------------------
  // Notification Actions
  // ----------------------------------------------------

  const sendNewNotification = (notification: Omit<MockNotification, "id" | "status" | "sentAt">) => {
    const isScheduled = !!notification.scheduledFor;
    const sentTime = isScheduled ? undefined : new Date().toISOString();
    
    const newNotif: MockNotification = {
      ...notification,
      id: `notif_${Date.now()}`,
      status: isScheduled ? "scheduled" : "sent",
      sentAt: sentTime
    };

    setNotifications(prev => [newNotif, ...prev]);
    logAction("Send Notification", `Dispatched ${notification.type} notification: "${notification.title}" to target segment: ${notification.target}`);
  };

  // ----------------------------------------------------
  // Audit Logging
  // ----------------------------------------------------

  const logAction = (action: string, details: string) => {
    const freshLog: MockAuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      userEmail: "admin@controlcenter.co", // Default active admin user
      userRole: "Owner",
      details,
      projectId: currentProjectId
    };

    setProjectAuditLogs(prev => ({
      ...prev,
      [currentProjectId]: [freshLog, ...(prev[currentProjectId] || [])]
    }));
  };

  return (
    <ProjectContext.Provider value={{
      projects: projectsList,
      currentProjectId,
      currentProject,
      users,
      collections,
      storageFiles,
      auditLogs,
      notifications,
      systemStatus,
      setCurrentProjectId,
      addProject,
      updateProject,
      deleteProject,
      addUser,
      updateUser,
      deleteUser,
      bulkUpdateRole,
      bulkDeleteUsers,
      addCollection,
      deleteCollection,
      addDocument,
      updateDocument,
      deleteDocument,
      uploadFile,
      deleteFile,
      sendNewNotification,
      logAction,
      liveActive,
      syncError,
      projectUsers
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
};
