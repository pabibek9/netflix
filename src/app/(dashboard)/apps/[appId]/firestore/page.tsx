"use client";

import React, { useState, useTransition, useMemo, use } from "react";
import { useProjects } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Database, FileText, Plus, Trash2, Edit2, 
  Check, X, Eye, Code, Layers, FileJson,
  CornerDownRight, Image as ImageIcon, AlertTriangle, Calendar,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PageProps {
  params: Promise<{ appId: string }>;
}

export default function FirestoreExplorerPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { 
    collections, addCollection, deleteCollection, 
    addDocument, updateDocument, deleteDocument, logAction 
  } = useProjects();
  const { hasPermission } = useAuth();

  // Selected paths
  const [selectedCol, setSelectedCol] = useState<string>(collections[0]?.name || "");
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  
  // Editor mode: "visual" | "json"
  const [editMode, setEditMode] = useState<"visual" | "json">("visual");

  // Create Wizards States
  const [addColOpen, setAddColOpen] = useState(false);
  const [newColName, setNewColName] = useState("");

  const [addDocOpen, setAddDocOpen] = useState(false);
  const [newDocId, setNewDocId] = useState("");

  // Search/Filters
  const [colSearch, setColSearch] = useState("");
  const [docSearch, setDocSearch] = useState("");

  // Inline field editing state
  const [addingField, setAddingField] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<"string" | "number" | "boolean" | "timestamp">("string");
  const [newFieldValue, setNewFieldValue] = useState("");

  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState("");

  // Get active collection & document details
  const activeColData = collections.find(c => c.name === selectedCol);
  
  const activeDocData = useMemo(() => {
    if (!activeColData) return null;
    if (selectedDocId) {
      return activeColData.documents.find(d => d.id === selectedDocId) || null;
    }
    // Default select first doc if none selected
    if (activeColData.documents.length > 0) {
      return activeColData.documents[0];
    }
    return null;
  }, [activeColData, selectedDocId]);

  // Set default selected document ID when switching collection
  React.useEffect(() => {
    if (activeColData && activeColData.documents.length > 0) {
      setSelectedDocId(activeColData.documents[0].id);
    } else {
      setSelectedDocId("");
    }
  }, [selectedCol, activeColData]);

  // Load JSON text on document select
  React.useEffect(() => {
    if (activeDocData) {
      setJsonText(JSON.stringify(activeDocData.data, null, 2));
      setJsonError("");
    } else {
      setJsonText("");
    }
  }, [activeDocData]);

  // Filters collections
  const filteredCollections = collections.filter(c => 
    c.name.toLowerCase().includes(colSearch.toLowerCase())
  );

  // Filters documents
  const filteredDocuments = useMemo(() => {
    if (!activeColData) return [];
    return activeColData.documents.filter(d => 
      d.id.toLowerCase().includes(docSearch.toLowerCase())
    );
  }, [activeColData, docSearch]);

  // Actions
  const handleCreateCol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName) return;
    const cleanName = newColName.toLowerCase().replace(/\s+/g, "-");
    addCollection(cleanName);
    setSelectedCol(cleanName);
    setNewColName("");
    setAddColOpen(false);
  };

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCol) return;
    const cleanId = newDocId.trim() || `doc_${Date.now()}`;
    addDocument(selectedCol, cleanId, { status: "initialized", sample_field: "value" });
    setSelectedDocId(cleanId);
    setNewDocId("");
    setAddDocOpen(false);
  };

  const handleDeleteDoc = () => {
    if (!selectedCol || !activeDocData || !hasPermission("Admin")) return;
    deleteDocument(selectedCol, activeDocData.id);
    setSelectedDocId("");
  };

  const handleAddField = () => {
    if (!selectedCol || !activeDocData || !newFieldName || !hasPermission("Admin")) return;
    
    let castedVal: any = newFieldValue;
    if (newFieldType === "number") castedVal = Number(newFieldValue) || 0;
    if (newFieldType === "boolean") castedVal = newFieldValue === "true";
    if (newFieldType === "timestamp") castedVal = new Date().toISOString();

    const updatedData = { ...activeDocData.data, [newFieldName]: castedVal };
    updateDocument(selectedCol, activeDocData.id, updatedData);
    
    // Clear adding form
    setNewFieldName("");
    setNewFieldValue("");
    setAddingField(false);
  };

  const handleDeleteField = (key: string) => {
    if (!selectedCol || !activeDocData || !hasPermission("Admin")) return;
    const updatedData = { ...activeDocData.data };
    delete updatedData[key];
    updateDocument(selectedCol, activeDocData.id, updatedData);
  };

  const handleJsonSave = () => {
    if (!selectedCol || !activeDocData || !hasPermission("Admin")) return;
    try {
      const parsed = JSON.parse(jsonText);
      updateDocument(selectedCol, activeDocData.id, parsed);
      setJsonError("");
      logAction("Edit Firestore", `Modified JSON payload for /${selectedCol}/${activeDocData.id}`);
    } catch (err: any) {
      setJsonError(err.message || "Invalid JSON syntax.");
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#09090B] select-none text-zinc-300">
      
      {/* COLUMN 1: Collections Browser (1/4 Width) */}
      <div className="w-1/4 border-r border-zinc-850 flex flex-col h-full bg-[#0B0B0C]/40">
        <div className="p-4 border-b border-zinc-850 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-white">COLLECTIONS</span>
            {hasPermission("Admin") && (
              <button
                onClick={() => setAddColOpen(true)}
                className="p-1 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded transition"
                title="Create Collection"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <input
            type="text"
            placeholder="Filter collections..."
            value={colSearch}
            onChange={(e) => setColSearch(e.target.value)}
            className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 placeholder-zinc-700 text-[10px] rounded-md px-2.5 py-1.5 outline-none focus:border-zinc-700 transition"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {filteredCollections.length === 0 ? (
            <p className="text-center py-6 text-[10px] text-zinc-650 font-mono">No collections.</p>
          ) : (
            filteredCollections.map(col => {
              const isActive = selectedCol === col.name;
              return (
                <button
                  key={col.name}
                  onClick={() => setSelectedCol(col.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition ${
                    isActive 
                      ? "bg-[#E5091410] border border-[#E5091420] text-white font-semibold"
                      : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Layers className={`w-3.5 h-3.5 ${isActive ? "text-[#E50914]" : "text-zinc-500"}`} />
                    <span className="truncate">{col.name}</span>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-600">({col.documents.length})</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* COLUMN 2: Documents Browser (1/3 Width) */}
      <div className="w-1/3 border-r border-zinc-850 flex flex-col h-full bg-[#09090B]">
        <div className="p-4 border-b border-zinc-850 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-white">DOCUMENTS</span>
              {selectedCol && <span className="text-[9px] text-[#E50914] font-mono">/{selectedCol}</span>}
            </div>
            {selectedCol && hasPermission("Admin") && (
              <button
                onClick={() => setAddDocOpen(true)}
                className="p-1 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded transition"
                title="Create Document"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <input
            type="text"
            placeholder="Search Document IDs..."
            value={docSearch}
            onChange={(e) => setDocSearch(e.target.value)}
            className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 placeholder-zinc-700 text-[10px] rounded-md px-2.5 py-1.5 outline-none focus:border-zinc-700 transition"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {filteredDocuments.length === 0 ? (
            <p className="text-center py-8 text-[10px] text-zinc-600 font-mono">No documents found.</p>
          ) : (
            filteredDocuments.map(doc => {
              const isActive = activeDocData?.id === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition ${
                    isActive 
                      ? "bg-[#E5091410] border border-[#E5091420] text-white font-semibold"
                      : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#E50914]" : "text-zinc-500"}`} />
                    <span className="truncate text-left">{doc.id}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* COLUMN 3: Fields Editor / Document Detail (Remaining Width) */}
      <div className="flex-1 flex flex-col h-full bg-[#09090B] overflow-hidden">
        {activeDocData ? (
          <>
            {/* Header Path */}
            <div className="p-4 border-b border-zinc-850 flex items-center justify-between shrink-0 bg-[#0B0B0C]/30">
              <div className="min-w-0 leading-tight">
                <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                  <span>databases</span>
                  <ChevronRight className="w-3 h-3 text-zinc-700" />
                  <span>default</span>
                  <ChevronRight className="w-3 h-3 text-zinc-700" />
                  <span className="text-zinc-300 font-semibold">/{selectedCol}</span>
                </div>
                <h3 className="text-sm font-semibold text-white truncate mt-1">
                  Document ID: <span className="text-[#E50914]">{activeDocData.id}</span>
                </h3>
              </div>

              {/* Mode Toggles */}
              <div className="flex items-center gap-2">
                <div className="flex bg-[#09090B] border border-zinc-800 p-0.5 rounded-lg">
                  <button
                    onClick={() => setEditMode("visual")}
                    className={`px-3 py-1 rounded-md text-[9px] uppercase font-mono tracking-wider transition ${
                      editMode === "visual" ? "bg-[#111113] text-white" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Visual View
                  </button>
                  <button
                    onClick={() => setEditMode("json")}
                    className={`px-3 py-1 rounded-md text-[9px] uppercase font-mono tracking-wider transition ${
                      editMode === "json" ? "bg-[#111113] text-white" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Raw JSON
                  </button>
                </div>
                {hasPermission("Admin") && (
                  <button
                    onClick={handleDeleteDoc}
                    className="p-1.5 hover:bg-red-950/20 border border-zinc-800 hover:border-red-900/30 text-zinc-500 hover:text-[#E50914] rounded-lg transition"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {editMode === "visual" ? (
                /* VISUAL TREE VIEW */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Document Fields ({Object.keys(activeDocData.data).length})</span>
                    {hasPermission("Admin") && !addingField && (
                      <button
                        onClick={() => setAddingField(true)}
                        className="flex items-center gap-1 text-[10px] font-mono text-[#E50914] hover:text-red-400 font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Field
                      </button>
                    )}
                  </div>

                  {/* Add Field Inline Box */}
                  <AnimatePresence>
                    {addingField && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="bg-[#111113] border border-zinc-800 p-4 rounded-xl space-y-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-zinc-850">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase">PROVISION NEW DOCUMENT FIELD</span>
                          <button onClick={() => setAddingField(false)} className="text-zinc-650 hover:text-zinc-350">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-[8px] text-zinc-500 font-mono block mb-1">FIELD NAME</label>
                            <input
                              type="text"
                              placeholder="ratings"
                              value={newFieldName}
                              onChange={(e) => setNewFieldName(e.target.value)}
                              className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 font-mono text-[10px] rounded px-2.5 py-1.5 outline-none focus:border-zinc-700"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] text-zinc-500 font-mono block mb-1">TYPE</label>
                            <select
                              value={newFieldType}
                              onChange={(e) => setNewFieldType(e.target.value as any)}
                              className="w-full bg-[#09090B] border border-zinc-800 text-zinc-400 font-mono text-[10px] rounded px-2 py-1.5 outline-none cursor-pointer"
                            >
                              <option value="string">string</option>
                              <option value="number">number</option>
                              <option value="boolean">boolean</option>
                              <option value="timestamp">timestamp</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[8px] text-zinc-500 font-mono block mb-1">VALUE</label>
                            <input
                              type="text"
                              placeholder={newFieldType === "boolean" ? "true / false" : "Value..."}
                              value={newFieldValue}
                              onChange={(e) => setNewFieldValue(e.target.value)}
                              className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 font-mono text-[10px] rounded px-2.5 py-1.5 outline-none focus:border-zinc-700"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setAddingField(false)}
                            className="px-2.5 py-1 bg-transparent hover:bg-zinc-900 border border-zinc-800 text-zinc-400 text-[9px] rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddField}
                            className="px-2.5 py-1 bg-[#E50914] text-white text-[9px] font-semibold rounded"
                          >
                            Add Field
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Fields list */}
                  <div className="space-y-2">
                    {Object.entries(activeDocData.data).map(([key, val]) => {
                      const type = typeof val;
                      const isImgUrl = typeof val === "string" && (val.startsWith("http") || val.startsWith("https")) && (val.includes(".jpg") || val.includes(".png") || val.includes("images.unsplash.com") || val.includes("dicebear"));
                      
                      return (
                        <div 
                          key={key} 
                          className="flex items-center justify-between p-3.5 bg-[#111113] border border-zinc-850 rounded-xl hover:border-zinc-800 transition duration-150 group"
                        >
                          <div className="flex items-start gap-4 min-w-0 flex-1">
                            <div className="shrink-0 mt-1">
                              <CornerDownRight className="w-3.5 h-3.5 text-zinc-650" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-zinc-200 font-semibold">{key}</span>
                                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-[#09090B] text-zinc-500 border border-zinc-900">{type}</span>
                              </div>
                              
                              {/* Inline representation */}
                              <div className="mt-1">
                                {isImgUrl ? (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[10px]">
                                      <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
                                      <span className="truncate">{String(val)}</span>
                                    </div>
                                    <img src={String(val)} alt={key} className="w-16 h-16 object-cover rounded-lg border border-zinc-800 shadow-md" />
                                  </div>
                                ) : type === "object" ? (
                                  <pre className="text-[10px] text-zinc-500 bg-[#09090B] p-2 rounded border border-zinc-900 font-mono overflow-x-auto">
                                    {JSON.stringify(val, null, 2)}
                                  </pre>
                                ) : (
                                  <span className="text-zinc-450 font-mono break-all">{String(val)}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          {hasPermission("Admin") && (
                            <button
                              onClick={() => handleDeleteField(key)}
                              className="p-1 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-[#E50914] rounded transition shrink-0"
                              title="Delete Field"
                            >
                              <X className="w-4.5 h-4.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* JSON CODE VIEW */
                <div className="space-y-4 h-full flex flex-col justify-between">
                  <div className="flex-1 flex flex-col min-h-[300px]">
                    <textarea
                      value={jsonText}
                      onChange={(e) => setJsonText(e.target.value)}
                      className="w-full flex-1 bg-[#09090B] border border-zinc-800 text-zinc-300 font-mono text-xs rounded-xl p-4 outline-none focus:border-zinc-700 transition resize-none min-h-[320px]"
                      placeholder="{}"
                    />
                    {jsonError && (
                      <div className="mt-2.5 flex items-start gap-2 p-3 bg-red-950/20 border border-red-900/30 text-red-400 rounded-lg text-xs font-mono">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{jsonError}</span>
                      </div>
                    )}
                  </div>

                  {hasPermission("Admin") && (
                    <button
                      onClick={handleJsonSave}
                      className="py-2 bg-[#E50914] hover:bg-[#B8070F] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition duration-150 cursor-pointer shadow-lg shadow-[#E50914]/10 active:scale-98"
                    >
                      <Check className="w-4 h-4" /> Save Document Payload
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Document Footer (Metadata) */}
            <div className="p-4 border-t border-zinc-850 bg-[#0B0B0C]/40 flex items-center justify-between text-[9px] text-zinc-500 font-mono shrink-0">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Updated: {new Date(activeDocData.updatedAt).toLocaleString()}</span>
              <span>Created: {new Date(activeDocData.createdAt).toLocaleDateString()}</span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Database className="w-12 h-12 text-zinc-800 mb-4" />
            <h3 className="text-zinc-400 font-semibold text-sm">No Document Selected</h3>
            <p className="text-xs text-zinc-650 mt-1">Select a document from middle panel or add a new record.</p>
          </div>
        )}
      </div>

      {/* Add Collection Modal */}
      <AnimatePresence>
        {addColOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddColOpen(false)}
              className="absolute inset-0 bg-[#09090BB8] backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xs bg-[#111113] border border-zinc-800 rounded-xl p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-850 mb-4">
                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Create Collection</h3>
                <button onClick={() => setAddColOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCol} className="space-y-4">
                <div>
                  <label className="text-[8px] text-zinc-500 font-mono block mb-1">COLLECTION PATH ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., movies"
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#E50914] transition"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#E50914] hover:bg-[#B8070F] text-white text-xs font-semibold rounded-lg transition"
                >
                  Create Collection Path
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Document Modal */}
      <AnimatePresence>
        {addDocOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddDocOpen(false)}
              className="absolute inset-0 bg-[#09090BB8] backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xs bg-[#111113] border border-zinc-800 rounded-xl p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-850 mb-4">
                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Create Document</h3>
                <button onClick={() => setAddDocOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateDoc} className="space-y-4">
                <div>
                  <label className="text-[8px] text-zinc-500 font-mono block mb-1">DOCUMENT ID (AUTO GENERATE IF BLANK)</label>
                  <input
                    type="text"
                    placeholder="e.g., movie_avatar_2"
                    value={newDocId}
                    onChange={(e) => setNewDocId(e.target.value)}
                    className="w-full bg-[#09090B] border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#E50914] transition"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#E50914] hover:bg-[#B8070F] text-white text-xs font-semibold rounded-lg transition"
                >
                  Create Document ID
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
