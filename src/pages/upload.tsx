import styles from "@/styles/UploadPage.module.css";
import { useRef, useState } from "react";
import { uploadAssetFile, createAsset, updateAsset } from "@/lib/assetRepository";
import { createVersion, updateVersion } from "@/lib/versionRepository";
import { useAuth } from "@/contexts/AuthContext";

export default function Upload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !category) {
      setMessage("ファイル・タイトル・カテゴリは必須です");
      return;
    }
    setUploading(true);
    setMessage("");
    try {
      const fileResult = await uploadAssetFile(file);
      const now = new Date().toISOString();
      const assetData = {
        title,
        description,
        category,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        uploader: user?.displayName || user?.email || "anonymous",
        uploadedAt: now,
        updatedAt: now,
        visibility,
        isDeleted: false,
      };
      const assetId = await createAsset(assetData);
      const versionData = {
        assetId,
        version: "1",
        fileUrl: fileResult.url,
        fileName: fileResult.name,
        fileType: fileResult.type,
        fileSize: fileResult.size,
        updatedAt: now,
        updatedBy: user?.displayName || user?.email || "anonymous",
      };
      const versionId = await createVersion(versionData);
      await updateVersion(versionId, { assetId });
      await updateAsset(assetId, { latestVersionId: versionId });
      setMessage("アップロードが完了しました");
      setFile(null);
      setTitle("");
      setDescription("");
      setCategory("");
      setTags("");
      setVisibility('public');
    } catch (err) {
      setMessage("アップロードに失敗しました");
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Upload Assets</h1>
      </div>
      <form className={styles.uploadArea} onSubmit={handleSubmit}>
        <div
          className={styles.dropZone}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={styles.dropText}>Drag and drop files here</div>
          <div className={styles.browseText}>Or click to browse your files</div>
          <input
            type="file"
            multiple={false}
            className={styles.fileInput}
            ref={fileInputRef}
            onChange={handleFileChange}
            onClick={e => e.stopPropagation()}
          />
          {file && <div style={{ marginTop: 8 }}>{file.name}</div>}
        </div>
        <div className={styles.metaSection}>
          <div className={styles.metaField}>
            <label className={styles.metaLabel}>Title</label>
            <input className={styles.metaInput} type="text" placeholder="Enter asset title" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className={styles.metaField}>
            <label className={styles.metaLabel}>Description</label>
            <textarea className={styles.metaInput} placeholder="Enter asset description" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className={styles.metaField}>
            <label className={styles.metaLabel}>Category</label>
            <select className={styles.metaInput} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Select a category</option>
              <option>Design</option>
              <option>Photo</option>
              <option>Video</option>
              <option>Graphic</option>
              <option>Template</option>
              <option>Banner</option>
              <option>Infographic</option>
            </select>
          </div>
          <div className={styles.metaField}>
            <label className={styles.metaLabel}>Tags</label>
            <input className={styles.metaInput} type="text" placeholder="Add tags (カンマ区切り)" value={tags} onChange={e => setTags(e.target.value)} />
          </div>
          <div className={styles.metaFieldRow}>
            <div className={styles.metaField}>
              <label className={styles.metaLabel}>Visibility</label>
              <div className={styles.visibilityRow}>
                <label className={styles.radioLabel}><input type="radio" name="visibility" checked={visibility==='public'} onChange={()=>setVisibility('public')} /> Public</label>
                <label className={styles.radioLabel}><input type="radio" name="visibility" checked={visibility==='private'} onChange={()=>setVisibility('private')} /> Private</label>
              </div>
            </div>
            <div className={styles.metaField}>
              <button className={styles.uploadBtn} type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Upload"}</button>
            </div>
          </div>
          {message && <div style={{ color: message.includes('完了') ? 'green' : 'red', marginTop: 8 }}>{message}</div>}
        </div>
      </form>
    </div>
  );
} 