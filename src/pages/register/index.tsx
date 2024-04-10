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

interface Car {
    id: string;
    name: string;
    owner: string; // Indica o proprietário do carro
}

export function Register() {
    const { handleInfoUser, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange"
    });

    const [cars, setCars] = useState<Car[]>([]); // Lista de carros

    useEffect(() => {
        // Simulação de uma função para buscar todos os carros do banco de dados
        // Substitua essa simulação pela lógica real de busca de carros
        const fetchCars = async () => {
            // Aqui você precisa implementar a lógica para buscar os carros do banco de dados
            // Por exemplo:
            const fetchedCars: Car[] = await fetchCarsFromDatabase();
            setCars(fetchedCars);
        };

        fetchCars();
    }, []);

    async function onSubmit(data: FormData) {
        createUserWithEmailAndPassword(auth, data.email, data.password)
        .then(async (user) => {
            await updateProfile(user.user, {
                displayName: data.name
            });

            handleInfoUser({
                name: data.name,
                email: data.email,
                uid: user.user.uid,
                role: data.role // Usando diretamente a propriedade data.role
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

    function fetchCarsFromDatabase(): Promise<Car[]> {
        // Aqui você implementa a lógica real para buscar os carros do banco de dados
        // Por exemplo, pode ser uma chamada para uma API ou uma consulta ao banco de dados
        // Retornaremos uma lista de carros simulada para este exemplo:
        return new Promise<Car[]>((resolve) => {
            const fetchedCars: Car[] = [
                { id: '1', name: 'Carro 1', owner: 'admin' },
                { id: '2', name: 'Carro 2', owner: 'revendedor1' },
                { id: '3', name: 'Carro 3', owner: 'revendedor2' },
            ];
            resolve(fetchedCars);
        });
    }

    return (
        <Container>
            <div className='w-full min-h-screen flex justify-center items-center flex-col gap-4'>
                <Link to="/" className="mb-6 max-w-sm w-full">
                    <img className="w-full" src={logoImg} alt="Logo do Site" />
                </Link>

                <form className="bg-white max-w-xl w-full rounded-lg p-4" onSubmit={handleSubmit(onSubmit)}>

                    {/* Se o usuário for Administrador, renderize todos os carros */}
                    {user?.role === 'Administrador' && (
                        <div className="mb-3">
                            <label>Todos os Carros:</label>
                            <ul>
                                {cars.map(car => (
                                    <li key={car.id}>{car.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Se o usuário for Revendedor, renderize apenas os carros do Revendedor */}
                    {user?.role === 'Revendedor' && (
                        <div className="mb-3">
                            <label>Seus Carros:</label>
                            <ul>
                                {cars.filter(car => car.owner === user.uid).map(car => (
                                    <li key={car.id}>{car.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="mb-3">
                        <Input type="text" placeholder="Digite seu nome completo..." error={errors.name?.message} {...register('name')} register={register} />
                    </div>

                    <div className="mb-3">
                        <Input type="email" placeholder="Digite seu email..." error={errors.email?.message} {...register('email')} register={register} />
                    </div>

                    <div className="mb-3">
                        <Input type="password" placeholder="Digite sua senha..." error={errors.password?.message} {...register('password')} register={register} />
                    </div>

                    <div className="flex flex-row mb-3 m-0 w-50">
                        <select className="w-full border-2 rounded-md h-11 px-2" {...register('role')}>
                            <option></option>
                            <option>Administrador</option>
                            <option>Revendedor</option>
                        </select>
                    </div>

                    {errors.role && (!user || (user.role !== 'Administrador' && user.role !== 'Revendedor')) && (
                        <p className="text-red-500">{errors.role.message}</p>
                    )}

                    <button type="submit" className="bg-zinc-900 w-full rounded-md text-white h-10 font-medium">Cadastrar</button>
                </form>

                <Link to="/login">Já possui uma conta? Faça o login!</Link>
            </div>
        </Container>
    )
}
