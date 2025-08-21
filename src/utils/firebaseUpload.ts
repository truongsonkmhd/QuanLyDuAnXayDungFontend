// utils/firebaseUpload.ts
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadDashboardXlsxBlob(blob: Blob, fileName: string) {
    const storage = getStorage();
    const fileRef = ref(storage, `dashboards/${fileName}`);
    await uploadBytes(fileRef, blob, {
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    return await getDownloadURL(fileRef); // URL public (có token)
}
