import { useEffect, useState } from "react";
import styles from "@/styles/VersionHistoryPage.module.css";
import { useRouter } from "next/router";
import { fetchVersions, revertVersion } from "@/lib/versionRepository";
import { Version } from "@/types/version";
import Image from "next/image";

export default function VersionHistory() {
  const router = useRouter();
  const { assetId } = router.query;
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [revertingId, setRevertingId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);

  useEffect(() => {
    if (typeof assetId === 'string') {
      fetchVersions(assetId).then(data => {
        setVersions(data);
        setLoading(false);
      });
    }
  }, [assetId]);

  const handleRevert = async (versionId: string) => {
    if (!assetId || typeof assetId !== 'string') return;
    if (!window.confirm('このバージョンに戻しますか？')) return;
    setRevertingId(versionId);
    try {
      await revertVersion(versionId, assetId);
      alert('バージョンを復元しました');
      // 最新のバージョン履歴を再取得
      const updated = await fetchVersions(assetId);
      setVersions(updated);
    } catch {
      alert('復元に失敗しました');
    }
    setRevertingId(null);
  };

  const handlePreview = (url: string, type: string) => {
    setPreviewUrl(url);
    setPreviewType(type);
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewType(null);
  };

  return (
    <div>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Version History</h1>
        <div className={styles.subtitle}>Review and manage previous versions of this asset.</div>
      </div>
      <div className={styles.tableWrapper}>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className={styles.versionTable}>
            <thead>
              <tr>
                <th>Version</th>
                <th>Updated</th>
                <th>Updated By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {versions.map(v => (
                <tr key={v.id}>
                  <td>{`Version ${v.version}`}</td>
                  <td>{v.updatedAt}</td>
                  <td>{v.updatedBy}</td>
                  <td className={styles.actionsCell}>
                    <button className={styles.actionBtn} onClick={() => handlePreview(v.fileUrl, v.fileType)}>Preview</button>
                    <a className={styles.actionBtn} href={v.fileUrl} target="_blank" rel="noopener noreferrer">Download</a>
                    <button className={styles.actionBtn} onClick={() => handleRevert(v.id)} disabled={revertingId === v.id}>
                      {revertingId === v.id ? "Reverting..." : "Revert"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* プレビューモーダル */}
      {previewUrl && (
        <div className={styles.previewModalOverlay} onClick={closePreview}>
          <div className={styles.previewModal} onClick={event => event.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closePreview}>×</button>
            {previewType?.startsWith('image') ? (
              <Image src={previewUrl ?? ''} alt="preview" className={styles.previewImg} width={400} height={300} />
            ) : previewType?.startsWith('video') ? (
              <video src={previewUrl ?? ''} controls className={styles.previewVideo} />
            ) : previewType?.includes('pdf') ? (
              <iframe src={previewUrl ?? ''} className={styles.previewDoc} />
            ) : (
              <div>プレビュー非対応のファイル形式です</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 