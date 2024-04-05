import { useEffect, useContext, useState } from 'react';
import logoImg from '../../assets/logo.svg';
import { Link, useNavigate } from 'react-router-dom';
import { Container } from '../../components/container';

import { Input } from '../../components/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { auth } from '../../services/firebaseConnection';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { AuthContext } from '../../contexts/AuthContext';

import toast from 'react-hot-toast';

const schema = z.object({
    name: z.string().nonempty("O campo nome é obrigatório!"),
    email: z.string().email("Insira um email válido!").nonempty("O campo email é obrigatório!"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres!").nonempty("O campo senha é obrigatório!"),
    role: z.string().nonempty("Selecione uma função").refine(value => value === 'Administrador' || value === 'Revendedor', {
        message: 'Selecione uma função válida'
    })
});

type FormData = z.infer<typeof schema>;

export function Register(){
    const [role, setRole] = useState<string>('');

    const { handleInfoUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange"
    });

    useEffect(() => {
        // handleLogout(); // Remove this line
    }, []);

    function getUserRoleFromOptions(selectedOption: string): string {
        if (selectedOption === "Administrador") {
            return "admin";
        } else if (selectedOption === "Revendedor") {
            return "revendedor";
        } else {
            return "usuario";
        }
    }

    async function onSubmit(data: FormData){
        createUserWithEmailAndPassword(auth, data.email, data.password)
        .then(async (user) => {
            await updateProfile(user.user, {
                displayName: data.name
            });

            const userRole = getUserRoleFromOptions(data.role);

            handleInfoUser({
                name: data.name,
                email: data.email,
                uid: user.user.uid,
                role: userRole
            });

            console.log("CADASTRADO COM SUCESSO!");
            toast.success("Cadastrado com sucesso!");
            navigate("/dashboard", { replace: true });

        })
        .catch((error) => {
            console.log("ERRO AO CADASTRAR ESTE USUÁRIO!");
            toast.error("Erro ao efetuar cadastro!");
            console.log(error);
        });

    }

    return(
        <Container>
            <div className='w-full min-h-screen flex justify-center items-center flex-col gap-4'>
                <Link to="/" className="mb-6 max-w-sm w-full">
                    <img className="w-full" src={logoImg} alt="Logo do Site" />
                </Link>

                <form className="bg-white max-w-xl w-full rounded-lg p-4" onSubmit={handleSubmit(onSubmit)}>

                    <div className="mb-3">
                        <Input type="text" placeholder="Digite seu nome completo..." error={errors.name?.message} {...register('name')} register={register}/>
                    </div>

                    <div className="mb-3">
                        <Input type="email" placeholder="Digite seu email..." error={errors.email?.message} {...register('email')} register={register}/>
                    </div>

                    <div className="mb-3">
                        <Input type="password" placeholder="Digite sua senha..." error={errors.password?.message} {...register('password')} register={register}/>
                    </div>

                    <div className="flex flex-row mb-3 m-0 w-50">
                        <select className="w-full border-2 rounded-md h-11 px-2" {...register('role')} onChange={(e) => setRole(e.target.value)}>
                            <option></option>
                            <option>Administrador</option>
                            <option>Revendedor</option>
                        </select>
                    </div>

                    {errors.role && role !== 'Administrador' && role !== 'Revendedor' && (
                        <p className="text-red-500">{errors.role.message}</p>
                    )}

                    <button type="submit" className="bg-zinc-900 w-full rounded-md text-white h-10 font-medium">Cadastrar</button>
                </form>

                <Link to="/login">Já possui uma conta? Faça o login!</Link>
            </div>
        </Container>
    )
}