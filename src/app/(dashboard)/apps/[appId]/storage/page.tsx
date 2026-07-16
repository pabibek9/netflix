"use client";

import React, { useState, useTransition, useMemo, use } from "react";
import { useProjects } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { 
  HardDrive, Search, Plus, Trash2, Download, Eye, 
  Folder, Image as ImageIcon, Video, FileText, File, 
  ArrowUp, CloudLightning, X, Check, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PageProps {
  params: Promise<{ appId: string }>;
}

export default function StorageBrowserPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { storageFiles, uploadFile, deleteFile, currentProject } = useProjects();
  const { hasPermission } = useAuth();

  // Selected folder path filter
  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals
  const [previewFile, setPreviewFile] = useState<any | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Upload Form
  const [uploadName, setUploadName] = useState("");
  const [uploadFolder, setUploadFolder] = useState("images");
  const [uploadSize, setUploadSize] = useState("1.2 MB");
  const [uploadType, setUploadType] = useState<"image" | "video" | "pdf" | "document">("image");

  // Storage Stats (Dynamic quota computation)
  const quotaUsed = currentProject?.storageUsed || "0 KB";
  const quotaPercent = quotaUsed.includes("GB") 
    ? Math.min(100, Math.round((parseFloat(quotaUsed) / 250) * 100)) 
    : 1;

  // Filtered files list
  const filteredFiles = useMemo(() => {
    let result = [...storageFiles];

    if (activeFolder !== "all") {
      result = result.filter(f => f.path.startsWith(`${activeFolder}/`));
    }

    if (searchQuery) {
      result = result.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return result;
  }, [storageFiles, activeFolder, searchQuery]);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName) return;

    const fileExtension = uploadType === "image" ? ".jpg" : uploadType === "video" ? ".mp4" : uploadType === "pdf" ? ".pdf" : ".json";
    const fullName = uploadName.includes(".") ? uploadName : `${uploadName}${fileExtension}`;

    uploadFile({
      name: fullName,
      path: `${uploadFolder}/${fullName}`,
      size: uploadSize || "1.2 MB",
      type: uploadType
    });

    setUploadOpen(false);
    setUploadName("");
    setUploadSize("1.2 MB");
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image": return <ImageIcon className="w-8 h-8 text-blue-400 shrink-0" />;
      case "video": return <Video className="w-8 h-8 text-purple-400 shrink-0" />;
      case "pdf": return <FileText className="w-8 h-8 text-red-400 shrink-0" />;
      case "document": return <File className="w-8 h-8 text-amber-400 shrink-0" />;
      default: return <File className="w-8 h-8 text-zinc-500 shrink-0" />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#09090B] select-none text-zinc-300">
      
      {/* LEFT PANEL: Filters & Storage Quota */}
      <div className="w-60 border-r border-zinc-850 p-5 flex flex-col justify-between h-full bg-[#0B0B0C]/40 shrink-0">
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-white">Folders Directory</span>
            <div className="space-y-1">
              {[
                { label: "All Objects", value: "all", count: storageFiles.length },
                { label: "Images", value: "images", count: storageFiles.filter(f => f.path.startsWith("images/")).length },
                { label: "Videos", value: "videos", count: storageFiles.filter(f => f.path.startsWith("videos/")).length },
                { label: "PDF Documents", value: "documents", count: storageFiles.filter(f => f.path.startsWith("documents/")).length },
                { label: "JSON Configs", value: "uploads", count: storageFiles.filter(f => f.path.startsWith("uploads/")).length }
              ].map((folder) => {
                const isActive = activeFolder === folder.value;
                return (
                  <button
                    key={folder.value}
                    onClick={() => setActiveFolder(folder.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      isActive 
                        ? "bg-[#E5091410] border border-[#E5091420] text-white" 
                        : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Folder className={`w-3.5 h-3.5 ${isActive ? "text-[#E50914]" : "text-zinc-500"}`} />
                      <span>{folder.label}</span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-650">({folder.count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Storage Quota Progress */}
        <div className="space-y-3 p-4 bg-[#111113] border border-zinc-850 rounded-xl">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span className="flex items-center gap-1"><CloudLightning className="w-3.5 h-3.5 text-[#E50914]" /> Storage Quota</span>
            <span>{quotaPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-900 border border-zinc-850 rounded-full overflow-hidden">
            <div className="h-full bg-[#E50914]" style={{ width: `${quotaPercent}%` }} />
          </div>
          <div className="text-[9px] font-mono text-zinc-450 leading-tight">
            <span>Using <strong className="text-zinc-200">{quotaUsed}</strong> of <strong className="text-zinc-400">250 GB</strong> allocated pool.</span>
          </div>
        </div>
      </div>

      {/* MAIN EXPLORER AREA */}
      <div className="flex-1 flex flex-col h-full bg-[#09090B] overflow-hidden">
        
        {/* Header toolbar */}
        <div className="p-4 border-b border-zinc-850 flex items-center justify-between bg-[#0B0B0C]/30 shrink-0">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search file name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 placeholder-zinc-700 text-xs rounded-lg pl-9 pr-4 py-2 outline-none focus:border-zinc-700 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="text-[10px] font-mono text-zinc-500 mr-2 uppercase">
              Path: <span className="text-white">storage / {activeFolder === "all" ? "*" : activeFolder}</span>
            </div>
            {hasPermission("Support") && (
              <button
                onClick={() => setUploadOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E50914] hover:bg-[#B8070F] text-white text-xs font-semibold rounded-lg transition duration-150 shadow-md active:scale-98 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Upload File
              </button>
            )}
          </div>
        </div>

        {/* Files Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredFiles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center border border-dashed border-zinc-850 rounded-2xl py-20">
              <HardDrive className="w-12 h-12 text-zinc-800 mb-4" />
              <h4 className="text-sm font-semibold text-zinc-400">No objects found</h4>
              <p className="text-xs text-zinc-600 mt-1">Upload a file or choose another folder.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredFiles.map((file) => (
                <div
                  key={file.path}
                  className="bg-[#111113] border border-zinc-850 hover:border-zinc-800 rounded-xl p-5 cursor-pointer flex flex-col justify-between group transition relative overflow-hidden"
                  onClick={() => setPreviewFile(file)}
                >
                  <div className="space-y-4">
                    {/* Icon & File Size */}
                    <div className="flex justify-between items-start">
                      <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
                        {getFileIcon(file.type)}
                      </div>
                      <span className="text-[9px] font-mono text-zinc-500">{file.size}</span>
                    </div>

                    {/* File Name & Path */}
                    <div className="min-w-0">
                      <h4 className="text-zinc-200 font-semibold text-xs truncate group-hover:text-[#E50914] transition" title={file.name}>
                        {file.name}
                      </h4>
                      <p className="text-[9px] text-zinc-500 font-mono truncate mt-0.5" title={file.path}>
                        /{file.path}
                      </p>
                    </div>
                  </div>

                  {/* Actions Header on hover */}
                  <div className="flex justify-between items-center border-t border-zinc-850 mt-5 pt-3.5 text-[9px] text-zinc-500 font-mono">
                    <span className="truncate">{new Date(file.updatedAt).toLocaleDateString()}</span>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-150" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => window.open(file.url, "_blank")}
                        className="p-1 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded"
                        title="Download file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      {hasPermission("Support") && (
                        <button
                          onClick={() => deleteFile(file.path)}
                          className="p-1 hover:bg-red-950/20 text-zinc-550 hover:text-[#E50914] rounded"
                          title="Delete object"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Upload Object Modal */}
      <AnimatePresence>
        {uploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUploadOpen(false)}
              className="absolute inset-0 bg-[#09090BB8] backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xs bg-[#111113] border border-zinc-800 rounded-xl p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-850 mb-4">
                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Upload Storage Object</h3>
                <button onClick={() => setUploadOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="text-[8px] text-zinc-500 font-mono block mb-1">OBJECT FILE NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., app_avatar"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    className="w-full bg-[#09090B] border border-zinc-800 text-zinc-350 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#E50914] transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[8px] text-zinc-500 font-mono block mb-1">FOLDER TARGET</label>
                    <select
                      value={uploadFolder}
                      onChange={(e) => setUploadFolder(e.target.value)}
                      className="w-full bg-[#09090B] border border-zinc-800 text-zinc-400 font-mono text-[9px] rounded p-1.5 outline-none cursor-pointer"
                    >
                      <option value="images">images/</option>
                      <option value="videos">videos/</option>
                      <option value="documents">documents/</option>
                      <option value="uploads">uploads/</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[8px] text-zinc-500 font-mono block mb-1">FILE TYPE</label>
                    <select
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value as any)}
                      className="w-full bg-[#09090B] border border-zinc-800 text-zinc-400 font-mono text-[9px] rounded p-1.5 outline-none cursor-pointer"
                    >
                      <option value="image">image</option>
                      <option value="video">video</option>
                      <option value="pdf">pdf</option>
                      <option value="document">json/txt</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[8px] text-zinc-500 font-mono block mb-1">SIMULATED FILE SIZE</label>
                  <input
                    type="text"
                    placeholder="e.g., 2.4 MB"
                    value={uploadSize}
                    onChange={(e) => setUploadSize(e.target.value)}
                    className="w-full bg-[#09090B] border border-zinc-800 text-zinc-350 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#E50914] transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#E50914] hover:bg-[#B8070F] text-white text-xs font-semibold rounded-lg transition"
                >
                  Upload Simulated Object
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image / Video / Document Preview Dialog */}
      <AnimatePresence>
        {previewFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewFile(null)}
              className="absolute inset-0 bg-[#09090BB8] backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#111113] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-zinc-850 bg-[#0B0B0C]/40 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400 font-bold truncate">/{previewFile.path}</span>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Preview Body based on type */}
              <div className="p-6 bg-[#09090B] flex justify-center items-center max-h-[400px] overflow-hidden">
                {previewFile.type === "image" ? (
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="max-h-[300px] object-contain rounded-lg border border-zinc-800"
                  />
                ) : previewFile.type === "video" ? (
                  <video
                    src={previewFile.url}
                    controls
                    className="w-full max-h-[300px] rounded-lg border border-zinc-800"
                  />
                ) : previewFile.type === "pdf" ? (
                  <div className="text-center py-10 space-y-3">
                    <FileText className="w-12 h-12 text-red-500 mx-auto" />
                    <p className="text-xs text-zinc-450 font-mono">Document (PDF Binary payload)</p>
                    <button
                      onClick={() => window.open(previewFile.url, "_blank")}
                      className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-semibold rounded-lg hover:border-zinc-700 transition"
                    >
                      Open PDF in New Tab
                    </button>
                  </div>
                ) : (
                  <div className="w-full">
                    <span className="text-[10px] font-mono text-zinc-500 block mb-1">RAW TEXT CONTENT</span>
                    <pre className="text-[10px] font-mono text-zinc-400 bg-zinc-950 p-4 border border-zinc-850 rounded-lg overflow-x-auto select-text">
                      {JSON.stringify({ rules: { ".read": "auth != null", ".write": "auth != null" } }, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-zinc-850 bg-[#111113] flex items-center justify-between text-[10px] font-mono text-zinc-500 shrink-0">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Updated: {new Date(previewFile.updatedAt).toLocaleDateString()}</span>
                <span>Size: {previewFile.size}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
