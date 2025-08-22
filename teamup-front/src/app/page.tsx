"use client";
import styles from "./page.module.css";

export default function Home() {

  if (typeof window !== "undefined") {
    window.location.href = "/home";
    return;
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>

      </main>
    </div>
  );
}
