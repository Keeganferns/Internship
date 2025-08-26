import React, { useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import app from "../firebase";

const storage = getStorage(app);

export default function StorageTest() {
  const [file, setFile] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const storageRef = ref(storage, `test-uploads/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setDownloadUrl(url);
      alert("Upload successful!");
    } catch (err) {
      setError("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: 20, border: "1px solid #ccc", borderRadius: 8, margin: 20 }}>
      <h2>Firebase Storage Test</h2>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={!file || uploading} style={{ marginLeft: 10 }}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
      {downloadUrl && (
        <div style={{ marginTop: 20 }}>
          <p>Download URL:</p>
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer">{downloadUrl}</a>
        </div>
      )}
    </div>
  );
} 