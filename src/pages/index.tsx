import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import Image from 'next/image';

import heroImg from '../../public/assets/hero.png'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefas+ | Organize suas tarefas de foram fácil</title>
      </Head>

      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image
            className={styles.hero}
            alt="Logo da Tarefas+"
            src={heroImg}
            priority
          />
        </div>
        <h1 className={styles.title}>
          Sistema feito para organizar <br/> 
          seus estudos e tarefas
        </h1>
      </main>
    </div>


  );
}
