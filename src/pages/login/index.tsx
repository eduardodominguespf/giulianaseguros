import { useEffect, useContext } from 'react';
import logoImg from '../../assets/logo.svg';
import { Link, useNavigate } from 'react-router-dom';
import { Container } from '../../components/container';

import { Input } from '../../components/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { AuthContext } from '../../contexts/AuthContext';
import { auth } from '../../services/firebaseConnection';

import toast from 'react-hot-toast';

const schema = z.object({
    email: z.string().email("Insira um email válido!").nonempty("O campo email é obrigatório!"),
    password: z.string().nonempty("O campo senha é obrigatório!")
});

type FormData = z.infer<typeof schema>

export function Login(){
    const { handleInfoUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors} } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange"
    });

    useEffect(() => {
        // handleLogout(); // Remove this line
    }, []);

    async function onSubmit(data: FormData){
        signInWithEmailAndPassword(auth, data.email, data.password)
        .then((userCredential) => {
            const user = userCredential.user;
            handleInfoUser({
                name: user.displayName,
                email: user.email,
                uid: user.uid,
                role: null // Defina o papel do usuário conforme necessário após o login
            });
            console.log("LOGADO COM SUCESSO!")
            toast.success("Logado com sucesso!")
            navigate("/dashboard", { replace: true })
        })
        .catch(err => {
            console.log("ERRO AO LOGAR!")
            console.log(err);
            toast.error("Erro ao fazer o login!")
        });
    };

    return(
        <Container>
            <div className='w-full min-h-screen flex justify-center items-center flex-col gap-4'>
                <Link to="/dashboard" className="mb-6 max-w-sm w-full">
                    <img className="w-full" src={logoImg} alt="Logo do Site" />
                </Link>

                <form className="bg-white max-w-xl w-full rounded-lg p-4" onSubmit={handleSubmit(onSubmit)}>

                    <div className="mb-3">
                        <Input type="email" placeholder="Digite seu email..." name="email" error={errors.email?.message} register={register}/>
                    </div>
                    <div className="mb-3">
                        <Input type="password" placeholder="Digite sua senha..." name="password" error={errors.password?.message} register={register}/>
                    </div>

                    <button type="submit" className="bg-zinc-900 w-full rounded-md text-white h-10 font-medium">Acessar</button>
                </form>

                <Link to="/register">Ainda não possui uma conta? Cadastre-se!</Link>
            </div>
        </Container>
    )
}
