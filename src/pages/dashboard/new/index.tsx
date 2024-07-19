import { ChangeEvent, useState, useContext, useEffect } from 'react';
import { Container } from '../../../components/container';
import { DashboardHeader } from '../../../components/panelheader';
import { FiUpload, FiTrash } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { Input } from '../../../components/input';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthContext } from '../../../contexts/AuthContext';
import { v4 as uuidV4 } from 'uuid';
import { storage, db } from '../../../services/firebaseConnection';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';
import toast from 'react-hot-toast';

const schema = z.object({
    name: z.string().nonempty("O campo nome é obrigatório!"),
    model: z.string().nonempty("O modelo é obrigatório!"),
    year: z.string().nonempty("O ano do carro é obrigatório!"),
    km: z.string().nonempty("O Km do carro é obrigatório!"),
    price: z.string().nonempty("O preço é obrigatório!"),
    city: z.string().nonempty("A cidade é obrigatória!"),
    whatsapp: z.string().min(1, "O telefone é obrigatório!").refine((value) => /^(\d{11,12})$/.test(value), {
        message: "Número de telefone inválido."
    }),
    description: z.string().nonempty("A descrição é obrigatória!")
});

type FormData = z.infer<typeof schema>;

interface ImageItemProps {
    uid: string;
    name: string;
    previewUrl: string;
    url: string;
};

export function New() {
    const { user } = useContext(AuthContext);
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange"
    });

    const [carImages, setCarImages] = useState<ImageItemProps[]>([]);

    useEffect(() => {
        if (!user) {
            console.log("Usuário não autenticado");
        } else {
            console.log("Usuário autenticado:", user);
        }
    }, [user]);

    async function handleFile(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            const image = e.target.files[0];

            if (image.type === 'image/jpeg' || image.type === 'image/png') {
                await handleUpload(image);
            } else {
                alert("Envie uma imagem jpeg ou png!");
                return;
            }
        }
    };

    async function handleUpload(image: File) {
        if (!user?.uid) {
            console.log("Usuário não autenticado");
            return;
        }
        const currentUid = user?.uid;
        const uidImage = uuidV4();

        const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`);

        try {
            const snapshot = await uploadBytes(uploadRef, image);
            const downloadURL = await getDownloadURL(snapshot.ref);
            const imageItem = {
                name: uidImage,
                uid: currentUid,
                previewUrl: URL.createObjectURL(image),
                url: downloadURL,
            };
            setCarImages((images) => [...images, imageItem]);
            toast.success("Imagem cadastrada com sucesso!");
            console.log("Imagem cadastrada:", imageItem);
        } catch (error) {
            console.error("Erro ao fazer upload da imagem:", error);
        }
    };

    async function handleDeleteImage(item: ImageItemProps) {
        const imagePath = `images/${item.uid}/${item.name}`;
        const imageRef = ref(storage, imagePath);

        try {
            await deleteObject(imageRef);
            setCarImages(carImages.filter((car) => car.url !== item.url));
            console.log("Imagem deletada:", item);
        } catch (err) {
            console.error("Erro ao deletar imagem:", err);
        }
    };

    async function onSubmit(data: FormData) {
        console.log("Dados do formulário:", data);

        if (carImages.length === 0) {
            toast.error("Envie pelo menos uma imagem!");
            return;
        }

        const carListImages = carImages.map(car => {
            return {
                uid: car.uid,
                name: car.name,
                url: car.url
            };
        });

        console.log("Imagens do carro:", carListImages);

        try {
            await addDoc(collection(db, "cars"), {
                name: data.name.toUpperCase(),
                model: data.model,
                whatsapp: data.whatsapp,
                city: data.city,
                year: data.year,
                km: data.km,
                price: data.price,
                description: data.description,
                created: new Date(),
                owner: user?.name,
                uid: user?.uid,
                images: carListImages
            });
            reset();
            setCarImages([]);
            toast.success("Cadastrado com sucesso!");
            console.log("Cadastrado com sucesso!");
        } catch (error) {
            console.error("Erro ao cadastrar no banco:", error);
            toast.error("Erro ao cadastrar no banco de dados");
        }
    };

    return (
        <div>
            <Container>
                <DashboardHeader />

                <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
                    <button className="border-2 w-28 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
                        <div className="absolute cursor-pointer">
                            <FiUpload size={30} color="#000" />
                        </div>
                        <div className="cursor-pointer">
                            <input type="file" accept="image/*" className="opacity-0 cursor-pointer" onChange={handleFile} />
                        </div>
                    </button>

                    {carImages.map(item => (
                        <div key={item.name} className="w-full h-32 flex items-center justify-center relative">
                            <button className="absolute" onClick={() => handleDeleteImage(item)}><FiTrash size={28} color="#fff" /></button>
                            <img src={item.previewUrl} className="rounded-lg w-full h-32 object-cover" alt="Foto do Carro" />
                        </div>
                    ))}
                </div>

                <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2">
                    <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-3">
                            <p className="mb-2 font-medium">Nome do Carro</p>
                            <Input type="text" register={register} name="name" error={errors.name?.message} placeholder="Ex: Honda Civic LXL..." />
                        </div>

                        <div className="mb-3">
                            <p className="mb-2 font-medium">Modelo do Carro</p>
                            <Input type="text" register={register} name="model" error={errors.model?.message} placeholder="Ex: 1.0 Flex PLUS MANUAL..." />
                        </div>

                        <div className="flex w-full mb-3 flex-row items-center gap-4">
                            <div className="w-full">
                                <p className="mb-2 font-medium">Ano</p>
                                <Input type="text" register={register} name="year" error={errors.year?.message} placeholder="Ex: 2010/2012..." />
                            </div>

                            <div className="w-full">
                                <p className="mb-2 font-medium">Km Rodados</p>
                                <Input type="text" register={register} name="km" error={errors.km?.message} placeholder="Ex: 23.000 Km..." />
                            </div>
                        </div>

                        <div className="flex w-full mb-3 flex-row items-center gap-4">
                            <div className="w-full">
                                <p className="mb-2 font-medium">Telefone / Whatsapp</p>
                                <Input type="text" register={register} name="whatsapp" error={errors.whatsapp?.message} placeholder="Ex: 011901010101..." />
                            </div>

                            <div className="w-full">
                                <p className="mb-2 font-medium">Cidade</p>
                                <Input type="text" register={register} name="city" error={errors.city?.message} placeholder="Ex: São Paulo - SP..." />
                            </div>
                        </div>

                        <div className="mb-3">
                            <p className="mb-2 font-medium">Preço</p>
                            <Input type="text" register={register} name="price" error={errors.price?.message} placeholder="Ex: R$ 47.533..." />
                        </div>

                        <div className="mb-3">
                            <p className="mb-2 font-medium">Descrição</p>
                            <textarea className="w-full rounded-lg h-32 p-2 border-2 border-gray-600" placeholder="Sobre o carro..." {...register("description")}></textarea>
                            {errors.description && <p className="text-red-500">{errors.description?.message}</p>}
                        </div>

                        <button type="submit" className="w-full rounded-md bg-zinc-900 text-white font-medium h-10">Cadastrar</button>
                    </form>
                </div>
            </Container>
        </div>
    )
}
