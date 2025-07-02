import styles from "@/styles/DashboardPage.module.css";
import { useEffect, useState } from "react";
import { fetchAssets } from "@/lib/assetRepository";
import { Asset } from "@/types/asset";

export default function Dashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalSize, setTotalSize] = useState(0);

  useEffect(() => {
    fetchAssets().then(data => {
      setAssets(data);
      setTotalSize(data.reduce((sum, a) => sum + (a.fileSize || 0), 0));
    });
  }, []);

  return (
    <>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.title}>Dashboard</h1>
      </div>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recently Uploaded Assets</h2>
        <div className={styles.assetList}>
          {assets.slice(0, 5).map(asset => (
            <div className={styles.assetCard} key={asset.id} onClick={()=>window.location.href=`/assets/${asset.id}`} style={{cursor:'pointer'}}>
              <div className={styles.assetThumb}></div>
              <div className={styles.assetName}>{asset.title}</div>
            </div>
          ))}
        </div>
      </section>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Storage Usage</h2>
        <div className={styles.storageBox}>
          <div className={styles.storageLabel}>Total Storage</div>
          <div className={styles.storageValue}>{(totalSize / 1024 / 1024).toFixed(2)} MB</div>
          <div className={styles.storageStatus}><span className={styles.current}>Current</span> <span className={styles.increase}>{((totalSize / 1024 / 1024 / 1024) * 100).toFixed(1)}%</span></div>
          <div className={styles.storageBar}><div className={styles.storageBarFill} style={{ width: `${Math.min(100, (totalSize / 1024 / 1024 / 1024) * 100)}%` }}></div></div>
          <div className={styles.storageDetail}><span className={styles.used}>Used</span> <span className={styles.available}>Available</span></div>
        </div>
      </section>
    </>
  );
} 