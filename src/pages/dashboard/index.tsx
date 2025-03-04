import { GetServerSideProps } from 'next';
import { ChangeEvent, FormEvent, useState, useEffect } from 'react';
import styles from './styles.module.css';
import Head from 'next/head';

import { getSession } from 'next-auth/react';
import { Textarea } from '../../components/textarea';
import { IoIosShareAlt } from "react-icons/io";
import { FaTrash } from 'react-icons/fa';

import { getFirestoreDB } from '../../services/firebaseConnection';
import { addDoc, collection, query, orderBy, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import Link from 'next/link';

interface DashboardProps {
    user: {
        email: string;
    }
}

interface TaskProps {
    id: string;
    created: Date;
    public: boolean;
    tarefa: string;
    user: string;
}

export default function Dashboard({ user }: DashboardProps) {
    const [input, setInput] = useState("");
    const [publicTask, setPublicTask] = useState(false);
    const [task, setTask] = useState<TaskProps[]>([])

    useEffect(() => {
        async function loadTarefas() {

            const db = getFirestoreDB();
            const tarefasRef = collection(db, "tarefas")
            const q = query(
                tarefasRef,
                orderBy("created", "desc"),
                where("user", "==", user?.email)
            )

            onSnapshot(q, (snapshot) => {
                let lista = [] as TaskProps[];

                snapshot.forEach((doc) => {
                    lista.push({
                        id: doc.id,
                        tarefa: doc.data().tarefa,
                        created: doc.data().created,
                        user: doc.data().user,
                        public: doc.data().public
                    })
                })

                setTask(lista);
            });
        }

        loadTarefas();
    }, [user?.email])

    function handleChangePublic(e: ChangeEvent<HTMLInputElement>) {
        console.log(e.target.checked)
        setPublicTask(e.target.checked)
    }

    async function handleRegisterTask(e: FormEvent) {
        e.preventDefault();

        if (input === "") return;

        try {
            const db = getFirestoreDB();

            await addDoc(collection(db, "tarefas"), {
                tarefa: input,
                created: new Date(),
                user: user?.email,
                public: publicTask
            });

            console.log("Tarefa adicionada com sucesso!");
            setInput("");
            setPublicTask(false);
        } catch (err) {
            console.log("Erro ao adicionar tarefa:", err);
        }
    }

    async function handleShare(id: string){
        await navigator.clipboard.writeText(
            `${process.env.NEXT_PUBLIC_URL}/task/${id}`
        );

        alert("URL COPIADA COM SUCESSO")
    }

    async function handleDeleteTask(id:string) {

        const db = getFirestoreDB();
        const docRef = doc(db, "tarefas", id)
        await deleteDoc(docRef)

    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Meu painel de tarefas</title>
            </Head>

            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}>Qual sua tarefa?</h1>

                        <form onSubmit={handleRegisterTask}>
                            <Textarea
                                placeholder='Digite sua tarefa...'
                                value={input}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                            />
                            <div className={styles.checkboxArea}>
                                <input
                                    type='checkbox'
                                    className={styles.checkbox}
                                    checked={publicTask}
                                    onChange={handleChangePublic}
                                />
                                <label> Deixar tarefa pública? </label>
                            </div>

                            <button className={styles.button} type='submit'>
                                Registrar Tarefa
                            </button>
                        </form>
                    </div>
                </section>

                <section className={styles.taskContainer}>
                    <h1>Minhas tarefas</h1>

                    {task.map((item) => (
                        <article key={item.id} className={styles.task}>
                            {item.public && (
                                <div className={styles.tagContainer}>
                                    <label className={styles.tag}>PÚBLICO</label>
                                    <button className={styles.shareButton} onClick={() => handleShare(item.id)}>
                                        <IoIosShareAlt
                                            size={22}
                                            color='#0f0f0f'
                                        />
                                    </button>
                                </div>
                            )}

                            <div className={styles.taskContent}>

                                {item.public ? (
                                    <Link href={`/task/${item.id}`}>
                                        <p>{item.tarefa}</p>
                                    </Link>
                                ) : (
                                    <p>{item.tarefa}</p>
                                )}

                                <button className={styles.trashButton} onClick={() => handleDeleteTask(item.id)}>
                                    <FaTrash
                                        size={24}
                                        color='#ea3140'
                                    />
                                </button>
                            </div>
                        </article>
                    ))}

                </section>
            </main>
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session = await getSession({ req });

    if (!session?.user) {
        console.log("Usuário não autenticado");
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    console.log("Usuário autenticado:", session.user.email);

    return {
        props: {
            user: {
                email: session.user.email
            },
        },
    };
};