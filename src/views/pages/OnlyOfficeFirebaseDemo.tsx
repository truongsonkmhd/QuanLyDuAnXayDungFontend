import React, { useMemo, useRef, useState } from "react";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/services/FirebaseConfig";

/**
 * 🔧 1) Fill your Firebase config below
 * - Create a Web app in Firebase Console → Project settings → SDK setup
 * - Make sure Firebase Storage is enabled
 */


// Initialize once (safe because React code runs in browser)
const storage = getStorage(app);

/**
 * ⚠️ OnlyOffice server URL
 * Example: https://onlyoffice.yourdomain.com
 * You must have an OnlyOffice Document Server running and accessible from the user's browser.
 */
const DEFAULT_ONLYOFFICE_SERVER = ""; // e.g., "https://onlyoffice.yourdomain.com"

// Helper: get extension & fileType for OnlyOffice
const getExt = (filename: string) => (filename.split(".").pop() || "").toLowerCase();
const onlyOfficeFileType = (ext: string) => {
  // Map common Office types; adjust if you need xlsx/pptx editors
  const map: Record<string, string> = {
    docx: "docx",
    doc: "doc",
    odt: "odt",
    rtf: "rtf",
    txt: "txt",
  };
  return map[ext] || "docx"; // default for this demo
};

export function OnlyOfficeFirebaseDemo() {
  const [serverUrl, setServerUrl] = useState<string>(DEFAULT_ONLYOFFICE_SERVER);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  async function handleUpload() {
    try {
      setError("");
      if (!file) throw new Error("Hãy chọn một tệp .docx trước.");
      if (!serverUrl) throw new Error("Hãy nhập URL OnlyOffice Document Server.");

      setUploading(true);
      const path = `documents/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setDownloadUrl(url);
    } catch (e: any) {
      setError(e.message || "Upload thất bại");
    } finally {
      setUploading(false);
    }
  }

  // Build OnlyOffice config when we have a downloadUrl
  const onlyOfficeSrc = useMemo(() => {
    if (!downloadUrl || !serverUrl) return "";
    const ext = getExt(file?.name || "docx");
    const config = {
      document: {
        fileType: onlyOfficeFileType(ext),
        key: `${Date.now()}_${file?.name || "doc"}`,
        title: file?.name || "Document.docx",
        url: downloadUrl, // Public URL from Firebase Storage
      },
      editorConfig: {
        mode: "edit", // or "view"
        callbackUrl: "", // Optional: your backend to receive save callbacks
      },
    };

    const encoded = encodeURIComponent(JSON.stringify(config));
    // For Word docs we use documenteditor; for xlsx/pptx you would switch to spreadsheeteditor/presentationeditor
    return `${serverUrl.replace(/\/$/, "")}/web-apps/apps/documenteditor?config=${encoded}`;
  }, [downloadUrl, serverUrl, file]);

  return (
    <div className="min-h-screen w-full px-6 py-8 flex flex-col gap-6 bg-gray-50">
      <div className="max-w-3xl w-full mx-auto bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Firebase → OnlyOffice (React + TS demo)</h1>
        <p className="text-sm text-gray-600">
          Chọn file .docx, upload lên Firebase Storage để lấy public URL, sau đó mở trong OnlyOffice.
        </p>

        <label className="block text-sm font-medium">OnlyOffice Server URL</label>
        <input
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value)}
          placeholder="https://onlyoffice.yourdomain.com"
          className="w-full rounded-xl border px-3 py-2"
        />

        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".doc,.docx,.odt,.rtf,.txt"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block"
          />
          <button
            onClick={handleUpload}
            disabled={!file || uploading || !serverUrl}
            className="rounded-2xl px-4 py-2 bg-black text-white disabled:opacity-50"
          >
            {uploading ? "Đang upload..." : "Upload & Mở"}
          </button>
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        {downloadUrl && (
          <div className="text-xs text-gray-700 break-all">
            File URL: {downloadUrl}
          </div>
        )}
      </div>

      {!!onlyOfficeSrc && (
        <div className="w-full max-w-6xl mx-auto">
          <iframe
            ref={iframeRef}
            title="OnlyOffice Editor"
            src={onlyOfficeSrc}
            className="w-full h-[80vh] rounded-2xl border shadow"
          />
        </div>
      )}

      <div className="max-w-3xl w-full mx-auto text-xs text-gray-500">
        <ul className="list-disc pl-5 space-y-1">
          <li>Đảm bảo Storage rules cho phép lấy file công khai (hoặc bạn dùng URL có token mặc định của Firebase).</li>
          <li>OnlyOffice server cần truy cập được URL Firebase từ trình duyệt người dùng.</li>
          <li>Muốn chỉnh xlsx/pptx: đổi endpoint sang <code>spreadsheeteditor</code> / <code>presentationeditor</code> và set <code>fileType</code> tương ứng.</li>
          <li>Nên tạo <code>callbackUrl</code> ở backend để nhận sự kiện lưu (save) của OnlyOffice nếu cần đồng bộ.</li>
        </ul>
      </div>
    </div>
  );
}
