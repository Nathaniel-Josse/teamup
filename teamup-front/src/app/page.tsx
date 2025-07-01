"use client";
import styles from "./page.module.css";

export default function Home() {

  if (typeof window !== "undefined") {
    if (localStorage.getItem("user")) {
      window.location.href = "/my-account";
      return;
    }
    window.location.href = "/auth/login";
    return;
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>

      </main>
    </div>
  );
}
