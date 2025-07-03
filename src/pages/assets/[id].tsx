import styles from "@/styles/AssetDetailPage.module.css";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { fetchAssetById, deleteAsset, deleteAssetFile, updateAsset, uploadAssetFile } from "@/lib/assetRepository";
import { Asset } from "@/types/asset";
import { createVersion, fetchVersionById } from "@/lib/versionRepository";
import { Version } from "@/types/version";
import { addComment, deleteComment, subscribeComments } from "@/lib/commentRepository";
import { Comment } from "@/types/comment";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { fetchVersions } from "@/lib/versionRepository";

export default function AssetDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editValues, setEditValues] = useState<Partial<Asset>>({});
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const [replacing, setReplacing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [latestVersion, setLatestVersion] = useState<Version | null>(null);

  useEffect(() => {
    if (typeof id === 'string') {
      fetchAssetById(id).then(data => {
        setAsset(data);
        setLoading(false);
        if (data?.latestVersionId) {
          fetchVersionById(data.latestVersionId).then(setLatestVersion);
        }
      });
      // コメントのリアルタイム購読
      const unsubscribe = subscribeComments(id, setComments);
      return () => unsubscribe();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!asset || deleting) return;
    if (!window.confirm("本当にこのアセットを削除しますか？（元に戻せません）")) return;
    setDeleting(true);
    try {
      // Storageからファイル削除
      if (latestVersion?.fileUrl) {
        const match = latestVersion.fileUrl.match(/\/o\/(.+)\?/);
        let storagePath = "";
        if (match && match[1]) {
          storagePath = decodeURIComponent(match[1]);
        } else if (latestVersion.fileUrl.startsWith("assets/")) {
          storagePath = latestVersion.fileUrl;
        }
        if (storagePath) {
          await deleteAssetFile(storagePath);
        }
      }
      // Firestoreからドキュメント削除
      await deleteAsset(asset.id!);
      alert("削除しました");
      router.push("/assets");
    } catch {}
    setDeleting(false);
  };

  const openEdit = () => {
    if (!asset) return;
    setEditValues({
      title: asset.title,
      description: asset.description,
      category: asset.category,
      tags: asset.tags,
      visibility: asset.visibility,
    });
    setEditMode(true);
  };

  const closeEdit = () => setEditMode(false);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditValues(v => ({ ...v, [name]: name === 'tags' ? value.split(',').map(s => s.trim()) : value }));
  };

  const handleEditSave = async () => {
    if (!asset) return;
    setSaving(true);
    try {
      await updateAsset(asset.id, editValues);
      setEditMode(false);
      // 最新データを再取得
      const updated = await fetchAssetById(asset.id);
      setAsset(updated);
    } catch {}
    setSaving(false);
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!asset || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setReplacing(true);
    try {
      // 新ファイルをStorageにアップロード
      const fileResult = await uploadAssetFile(file);
      const now = new Date().toISOString();
      // バージョン番号を決定（既存バージョン数+1）
      let versionNum = 2;
      try {
        const versions = await fetchVersions(asset.id);
        versionNum = (versions.length || 1) + 1;
      } catch {}
      // バージョン履歴を追加
      const newVersion = {
        assetId: asset.id,
        version: versionNum.toString(),
        fileUrl: fileResult.url,
        fileName: fileResult.name,
        fileType: fileResult.type,
        fileSize: fileResult.size,
        updatedAt: now,
        updatedBy: user?.displayName || user?.email || "anonymous",
      };
      const newVersionId = await createVersion(newVersion);
      // assetsのlatestVersionIdを更新
      await updateAsset(asset.id, {
        updatedAt: now,
        latestVersionId: newVersionId,
      });
      // 最新データを再取得
      const updated = await fetchAssetById(asset.id);
      setAsset(updated);
      alert("ファイルを差し替えました");
    } catch {}
    setReplacing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddComment = async () => {
    if (!id || !commentInput.trim() || !user?.displayName) return;
    setCommentLoading(true);
    const now = new Date().toISOString();
    await addComment({
      assetId: id as string,
      user: user.displayName || user.email || "anonymous",
      text: commentInput.trim(),
      createdAt: now,
    });
    setCommentInput("");
    setCommentLoading(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("このコメントを削除しますか？")) return;
    await deleteComment(commentId);
    // コメントはonSnapshotで自動更新されるので再取得不要
  };

  return (
    <div>
      <div className={styles.headerRow}>
        <div className={styles.breadcrumbs}>Assets / Image</div>
        <h1 className={styles.title}>Asset Details</h1>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : !asset ? (
        <div>Not found.</div>
      ) : (
        <>
          <div className={styles.detailGrid}>
            <div className={styles.assetPreview}>
              {!latestVersion ? (
                <div className={styles.assetPreviewNo}>Loading...</div>
              ) : latestVersion.fileType?.startsWith('image') ? (
                <Image src={latestVersion.fileUrl} alt={asset.title} className={styles.assetPreviewImg} width={400} height={300} />
              ) : latestVersion.fileType?.startsWith('video') ? (
                <video src={latestVersion.fileUrl} controls className={styles.assetPreviewVideo} />
              ) : latestVersion.fileType?.includes('pdf') ? (
                <iframe src={latestVersion.fileUrl} className={styles.assetPreviewDoc} />
              ) : (
                <div className={styles.assetPreviewNo}>プレビュー非対応</div>
              )}
            </div>
            <div className={styles.assetMeta}>
              <div className={styles.metaRow}><span className={styles.metaLabel}>Title</span><span>{asset.title}</span></div>
              <div className={styles.metaRow}><span className={styles.metaLabel}>Description</span><span>{asset.description}</span></div>
              <div className={styles.metaRow}><span className={styles.metaLabel}>File Name</span><span>{latestVersion?.fileName || (latestVersion === null ? 'Loading...' : '-')}</span></div>
              <div className={styles.metaRow}><span className={styles.metaLabel}>Format</span><span>{latestVersion?.fileType || (latestVersion === null ? 'Loading...' : '-')}</span></div>
              <div className={styles.metaRow}><span className={styles.metaLabel}>Size</span><span>{latestVersion ? (latestVersion.fileSize/1024/1024).toFixed(2) : (latestVersion === null ? 'Loading...' : '-')} MB</span></div>
              <div className={styles.metaRow}><span className={styles.metaLabel}>Uploader</span><span>{asset.uploader}</span></div>
              <div className={styles.metaRow}><span className={styles.metaLabel}>Uploaded</span><span>{asset.uploadedAt}</span></div>
              <div className={styles.metaRow}><span className={styles.metaLabel}>Last Updated</span><span>{asset.updatedAt}</span></div>
              <div className={styles.metaRow}><span className={styles.metaLabel}>Version</span><span>{latestVersion?.version || '-'}</span></div>
              <div className={styles.metaRow}><span className={styles.metaLabel}>Categories/Tags</span><span>{asset.category} / {asset.tags?.join(", ")}</span></div>
              <div className={styles.metaRow}><span className={styles.metaLabel}>Visibility</span><span>{asset.visibility}</span></div>
            </div>
          </div>
          <div className={styles.actionsRow}>
            <a className={styles.actionBtn} href={latestVersion?.fileUrl || '#'} target="_blank" rel="noopener noreferrer">Download</a>
            <button className={styles.actionBtn} onClick={openEdit}>Edit</button>
            <label className={styles.actionBtn} style={{ cursor: replacing ? 'not-allowed' : 'pointer', opacity: replacing ? 0.6 : 1 }}>
              {replacing ? "Replacing..." : "Replace File"}
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} disabled={replacing} onChange={handleReplaceFile} />
            </label>
            <button className={styles.actionBtn} onClick={()=>router.push(`/version-history?assetId=${asset.id}`)}>Version History</button>
            <button className={styles.actionBtn} onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</button>
          </div>
          <div className={styles.commentsSection}>
            <h2 className={styles.commentsTitle}>Comments</h2>
            <div className={styles.commentList}>
              {comments.map(c => (
                <div className={styles.commentItem} key={c.id}>
                  <div className={styles.commentHeader}>
                    <span className={styles.commentUser}>{c.user}</span>
                    <span className={styles.commentDate}>{c.createdAt.slice(0, 10)}</span>
                    {user?.displayName === c.user && (
                      <button className={styles.commentDeleteBtn} onClick={() => handleDeleteComment(c.id)}>削除</button>
                    )}
                  </div>
                  <div className={styles.commentText}>{c.text}</div>
                </div>
              ))}
            </div>
            <div className={styles.addCommentRow}>
              <input className={styles.addCommentInput} type="text" placeholder="Add a comment..." value={commentInput} onChange={e => setCommentInput(e.target.value)} />
              <button className={styles.addCommentBtn} onClick={handleAddComment} disabled={commentLoading || !commentInput.trim()}>{commentLoading ? "Posting..." : "Post"}</button>
            </div>
          </div>
          {editMode && (
            <div className={styles.editModalOverlay}>
              <div className={styles.editModal}>
                <h2>アセット情報の編集</h2>
                <div className={styles.editFormRow}>
                  <label>タイトル</label>
                  <input name="title" value={editValues.title || ''} onChange={handleEditChange} />
                </div>
                <div className={styles.editFormRow}>
                  <label>説明</label>
                  <textarea name="description" value={editValues.description || ''} onChange={handleEditChange} />
                </div>
                <div className={styles.editFormRow}>
                  <label>カテゴリ</label>
                  <select name="category" value={editValues.category || ''} onChange={handleEditChange}>
                    <option value="">選択してください</option>
                    <option value="Design">Design</option>
                    <option value="Photo">Photo</option>
                    <option value="Video">Video</option>
                    <option value="Graphic">Graphic</option>
                    <option value="Template">Template</option>
                    <option value="Banner">Banner</option>
                    <option value="Infographic">Infographic</option>
                  </select>
                </div>
                <div className={styles.editFormRow}>
                  <label>タグ（カンマ区切り）</label>
                  <input name="tags" value={Array.isArray(editValues.tags) ? editValues.tags.join(', ') : (editValues.tags || '')} onChange={handleEditChange} />
                </div>
                <div className={styles.editFormRow}>
                  <label>公開範囲</label>
                  <select name="visibility" value={editValues.visibility || ''} onChange={handleEditChange}>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div className={styles.editFormActions}>
                  <button onClick={handleEditSave} disabled={saving}>保存</button>
                  <button onClick={closeEdit} disabled={saving}>キャンセル</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 