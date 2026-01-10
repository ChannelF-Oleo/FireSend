"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, deleteObject } from "firebase/storage";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  Trash2,
  Loader2,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Clock,
  File,
} from "lucide-react";

interface KnowledgeDoc {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: "processing" | "ready" | "error";
  chunksCount?: number;
  uploadedAt: Date;
  error?: string;
}

const ALLOWED_TYPES = [
  "text/plain",
  "application/pdf",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function KnowledgePage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<KnowledgeDoc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;

    const docsRef = collection(db, "tenants", user.uid, "knowledge_docs");
    const q = query(docsRef, orderBy("uploadedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: KnowledgeDoc[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        docs.push({
          id: doc.id,
          fileName: data.fileName,
          fileType: data.fileType,
          fileSize: data.fileSize,
          status: data.status,
          chunksCount: data.chunksCount,
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
          error: data.error,
        });
      });
      setDocuments(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validaciones
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Tipo de archivo no soportado. Usa PDF, TXT, CSV o DOCX.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("El archivo es muy grande. Máximo 10MB.");
      return;
    }

    setUploading(true);

    try {
      // Subir a Firebase Storage
      const storageRef = ref(
        storage,
        `tenants/${user.uid}/docs/${Date.now()}_${file.name}`,
      );
      await uploadBytes(storageRef, file);

      toast.success("Archivo subido. Procesando...");
    } catch (error) {
      console.error("Error uploading:", error);
      toast.error("Error al subir el archivo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (docId: string, fileName: string) => {
    if (!user) return;

    try {
      // Eliminar documento de Firestore
      await deleteDoc(doc(db, "tenants", user.uid, "knowledge_docs", docId));

      // Intentar eliminar de Storage (puede fallar si ya no existe)
      try {
        const storageRef = ref(storage, `tenants/${user.uid}/docs/${fileName}`);
        await deleteObject(storageRef);
      } catch {
        // Ignorar error si el archivo no existe en storage
      }

      toast.success("Documento eliminado");
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Error al eliminar");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            <CheckCircle2 className="h-3 w-3" /> Listo
          </span>
        );
      case "processing":
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            <Clock className="h-3 w-3 animate-spin" /> Procesando
          </span>
        );
      case "error":
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
            <AlertCircle className="h-3 w-3" /> Error
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-[#FF4D00] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#6B6966] text-sm">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A1818] mb-2">
          Base de Conocimiento
        </h1>
        <p className="text-[#6B6966]">
          Sube documentos para que tu bot responda con información de tu negocio
        </p>
      </div>

      {/* Upload Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#FF4D00]/10 to-[#FF4D00]/5 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-[#FF4D00]" />
            </div>
            <div>
              <CardTitle>Subir Documento</CardTitle>
              <CardDescription>
                PDF, TXT, CSV o DOCX (máx. 10MB)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-[#E8E6E3] rounded-xl p-8 text-center hover:border-[#FF4D00]/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.csv,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 text-[#FF4D00] animate-spin" />
                <p className="text-sm text-[#6B6966]">Subiendo archivo...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="h-10 w-10 text-[#6B6966]" />
                <div>
                  <p className="text-sm font-medium text-[#1A1818]">
                    Arrastra un archivo o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-[#6B6966] mt-1">
                    Catálogos, FAQs, información de productos, precios...
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-blue-800">¿Cómo funciona?</p>
          <p className="text-sm text-blue-700 mt-1">
            Los documentos se procesan automáticamente y se dividen en
            fragmentos. Cuando un cliente hace una pregunta, el bot busca la
            información relevante en tu base de conocimiento para dar respuestas
            precisas.
          </p>
        </div>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos ({documents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-[#E8E6E3] mx-auto mb-3" />
              <p className="text-[#6B6966]">No hay documentos aún</p>
              <p className="text-sm text-[#6B6966] mt-1">
                Sube tu primer documento para empezar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-[#F9F8F6] rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center">
                      <File className="h-5 w-5 text-[#6B6966]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1A1818] text-sm">
                        {doc.fileName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#6B6966]">
                          {formatFileSize(doc.fileSize)}
                        </span>
                        {doc.chunksCount && (
                          <span className="text-xs text-[#6B6966]">
                            • {doc.chunksCount} fragmentos
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(doc.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(doc.id, doc.fileName)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
