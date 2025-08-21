// components/OnlyOfficeDashboard.tsx
import React, { useEffect, useRef, useState } from "react";
import { uploadDashboardXlsxBlob } from "@/utils/firebaseUpload";
import { Project } from "./exportDashboardXlsx";

declare global {
  interface Window { DocsAPI: any }
}

export default function OnlyOfficeDashboard({ projects }: { projects: Project[] }) {
  const containerId = "onlyoffice-container";
  const [fileUrl, setFileUrl] = useState<string>();
  const documentServerUrl = "https://docs.yourdomain.com"; // URL OnlyOffice Document Server

  // tạo file từ template và upload
  const generateAndUpload = async () => {
    const XLSX = await import("xlsx");

    const res = await fetch("/template_dashboard.xlsx");
    if (!res.ok) throw new Error("Không tìm thấy template_dashboard.xlsx");
    const buf = await res.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });

    const rows = projects.map(p => ({
      "Tên dự án": p.name ?? "",
      "Mô tả": p.description ?? "",
      "Trạng thái": p.status ?? "",
      "Tiến độ (%)": typeof p.progress === "number" ? p.progress : "",
      "Ngày bắt đầu": p.startDate ? new Date(p.startDate).toLocaleDateString() : "",
      "Ngày kết thúc": p.endDate ? new Date(p.endDate).toLocaleDateString() : "",
      "Quản lý": p.manager ?? "",
      "Số thành viên": p.teamSize ?? "",
      "Ngân sách kế hoạch (VND)": p.budgetPlan ?? "",
      "Ngân sách thực tế (VND)": p.budget ?? "",
      "Nhóm dự án": p.projectGroup ?? "",
      "Chủ đầu tư": p.investor ?? "",
      "Nguồn vốn": p.capitalSource ?? "",
      "Loại hình quản lý": p.managementType ?? "",
      "Cấp công trình": p.constructionLevel ?? "",
      "Loại công trình": p.constructionType ?? "",
      "Địa điểm xây dựng": p.constructionLocation ?? "",
      "Danh mục": p.category ?? "",
      "Vị trí": p.location ?? "",
      "Ngày tạo": p.createdAt ? new Date(p.createdAt).toLocaleString() : "",
      "Ngày cập nhật": p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "",
    }));
    const header = Object.keys(rows[0] ?? {});
    const aoa = [header, ...rows.map(r => header.map(h => r[h] ?? ""))];
    wb.Sheets["Data"] = (await import("xlsx")).utils.aoa_to_sheet(aoa);

    const out = (await import("xlsx")).write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([out], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = await uploadDashboardXlsxBlob(blob, `dashboard_${Date.now()}.xlsx`);
    setFileUrl(url);
  };

  // khởi tạo viewer khi có fileUrl
  useEffect(() => {
    if (!fileUrl) return;

    // nạp SDK OnlyOffice 1 lần nếu chưa có
    const ensureSdk = async () => {
      if (window.DocsAPI) return;
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.src = `${documentServerUrl}/web-apps/apps/api/documents/api.js`;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Load OnlyOffice SDK thất bại"));
        document.head.appendChild(s);
      });
    };

    (async () => {
      await ensureSdk();
      const key = `${new URL(fileUrl).pathname}-${Date.now()}`; // unique để tránh cache

      // @ts-ignore
      const editor = new window.DocsAPI.DocEditor("onlyoffice-container", {
        document: {
          fileType: "xlsx",
          title: "Project Dashboard.xlsx",
          url: fileUrl,
          key,
        },
        editorConfig: {
          mode: "view",
          lang: "vi",
          customization: {
            chat: false,
            comments: false,
            hideRightMenu: true,
            toolbar: true,
          },
        },
      });

      return () => {
        try { editor?.destroyEditor && editor.destroyEditor(); } catch { }
      };
    })();
  }, [fileUrl]);

  return (
    <div className="space-y-3">
      <button
        onClick={generateAndUpload}
        className="px-4 py-2 rounded-xl bg-blue-600 text-white"
      >
        Tạo & Mở Dashboard (OnlyOffice)
      </button>

      <div id={containerId} style={{ width: "100%", height: "80vh", borderRadius: 12 }} />
    </div>
  );
}
