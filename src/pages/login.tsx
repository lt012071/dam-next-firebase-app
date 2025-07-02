import styles from "@/styles/LoginPage.module.css";
import { signIn } from "next-auth/react";

export default function Login() {
  return (
    <div className={styles.loginRoot}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Digital Asset Management</h1>
        <form className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Username or Email</label>
            <input className={styles.input} type="text" placeholder="Username or Email" />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" placeholder="Password" />
          </div>
          <div className={styles.optionsRow}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" /> Remember me
            </label>
            <a className={styles.forgot} href="#">Forgot Password?</a>
          </div>
          <button className={styles.loginBtn} type="submit">Login</button>
        </form>
        <div className={styles.divider}>or</div>
        <button className={styles.googleBtn} type="button" onClick={() => signIn("google", { callbackUrl: '/' })}>Sign in with Google</button>
      </div>
    </div>
  );
} 