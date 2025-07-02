import styles from "@/styles/AssetsPage.module.css";
import { useEffect, useState } from "react";
import { fetchAssets, AssetFilter } from "@/lib/assetRepository";
import { Asset } from "@/types/asset";
import { fetchVersionById } from "@/lib/versionRepository";

export default function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [fileType, setFileType] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [uploadedAt, setUploadedAt] = useState("");
  const [title, setTitle] = useState("");
  const [page, setPage] = useState(1);
  const [versionMap, setVersionMap] = useState<Record<string, any>>({});
  const pageSize = 12;

  const fetchWithFilter = async (filter: AssetFilter) => {
    setLoading(true);
    const data = await fetchAssets({ ...filter, page, pageSize });
    setAssets(data);
    // 各assetのlatestVersionIdからバージョン情報を取得
    const versionResults = await Promise.all(
      data.map(async (asset) => {
        if (asset.latestVersionId) {
          const v = await fetchVersionById(asset.latestVersionId);
          return [asset.id, v];
        }
        return [asset.id, null];
      })
    );
    setVersionMap(Object.fromEntries(versionResults));
    setLoading(false);
  };

  useEffect(() => {
    fetchWithFilter({});
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [fileType, category, tags, uploadedAt, title]);

  useEffect(() => {
    fetchWithFilter({
      fileType: fileType || undefined,
      category: category || undefined,
      tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
      uploadedAt: uploadedAt || undefined,
      title: title || undefined,
    });
  }, [fileType, category, tags, uploadedAt, title, page]);

  return (
    <>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>All Assets</h1>
        <button className={styles.uploadBtn} onClick={()=>window.location.href='/upload'}>Upload</button>
      </div>
      <div className={styles.filterRow}>
        <input className={styles.searchInput} type="text" placeholder="Search  assets" value={title} onChange={e => setTitle(e.target.value)} />
        <select className={styles.filterSelect} value={fileType} onChange={e => setFileType(e.target.value)}>
          <option value="">File Type</option>
          <option value="PDF">PDF</option>
          <option value="JPG">JPG</option>
          <option value="PNG">PNG</option>
          <option value="MP4">MP4</option>
          <option value="SVG">SVG</option>
          <option value="PPTX">PPTX</option>
        </select>
        <select className={styles.filterSelect} value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">Category</option>
          <option value="Design">Design</option>
          <option value="Photo">Photo</option>
          <option value="Video">Video</option>
          <option value="Graphic">Graphic</option>
          <option value="Template">Template</option>
          <option value="Banner">Banner</option>
          <option value="Infographic">Infographic</option>
        </select>
        <input className={styles.searchInput} type="text" placeholder="Tags" value={tags} onChange={e => setTags(e.target.value)} />
        <input className={styles.searchInput} type="date" placeholder="Upload Date" value={uploadedAt} onChange={e => setUploadedAt(e.target.value)} />
      </div>
      <div className={styles.assetGrid}>
        {loading ? (
          <div>Loading...</div>
        ) : assets.length === 0 ? (
          <div>No assets found.</div>
        ) : (
          assets.map((asset) => {
            const version = versionMap[asset.id];
            return (
              <div className={styles.assetCard} key={asset.id} onClick={()=>window.location.href=`/assets/${asset.id}`} style={{cursor:'pointer'}}>
                <div className={styles.assetThumb}>
                  {!version ? (
                    <div style={{ color: '#aaa', fontSize: 12, textAlign: 'center', lineHeight: '64px' }}>Loading...</div>
                  ) : version.fileType?.startsWith('image') ? (
                    <img src={version.fileUrl} alt={asset.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                  ) : version.fileType?.startsWith('video') ? (
                    <video src={version.fileUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                  ) : version.fileType?.includes('pdf') ? (
                    <iframe src={version.fileUrl} style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8, background: '#fafafa' }} />
                  ) : (
                    <div style={{ color: '#aaa', fontSize: 12, textAlign: 'center', lineHeight: '64px' }}>No Preview</div>
                  )}
                </div>
                <div className={styles.assetInfo}>
                  <div className={styles.assetName}>{asset.title}</div>
                  <div className={styles.assetMeta}>{version?.fileType || '-'}</div>
                  <div className={styles.assetMeta}>{version?.fileName || '-'}</div>
                  <div className={styles.assetTags}>{asset.tags?.join(", ")}</div>
                  <div className={styles.assetDate}>{asset.uploadedAt}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className={styles.pagination}>
        {[1,2,3,4,5].map(p => (
          <button
            key={p}
            className={styles.pageBtn}
            onClick={() => setPage(p)}
            style={{ fontWeight: page === p ? 'bold' : undefined }}
          >
            {p}
          </button>
        ))}
      </div>
    </>
  );
} 