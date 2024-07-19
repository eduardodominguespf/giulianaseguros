import { useState, useEffect } from 'react';
import { Container } from '../../components/container';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseConnection';

interface CarProps {
  id: string;
  name: string;
  year: string;
  uid: string;
  price: string | number;
  city: string;
  km: string;
  images: CarImageProps[];
}

interface CarImageProps {
  name: string;
  uid: string;
  url: string;
}

export function Home() {
  const [cars, setCars] = useState<CarProps[]>([]);
  const [filteredCars, setFilteredCars] = useState<CarProps[]>([]);
  const [loadImages, setLoadImages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    loadAllCars();
  }, []);

  function loadAllCars() {
    const carsRef = collection(db, "cars");
    getDocs(carsRef)
      .then((snapshot) => {
        let listCars = [] as CarProps[];

        snapshot.forEach((doc) => {
          listCars.push({
            id: doc.id,
            name: doc.data().name,
            year: doc.data().year,
            km: doc.data().km,
            city: doc.data().city,
            price: doc.data().price,
            images: doc.data().images,
            uid: doc.data().uid
          });
        });

        setCars(listCars);
        setFilteredCars(listCars); // Inicialmente, todos os carros são filtrados
      })
      .catch((error) => {
        console.error("Error fetching cars: ", error);
      });
  }

  function handleSearchCar() {
    const searchTerm = input.toLowerCase();
    const filtered = cars.filter(car => 
      car.name.toLowerCase().includes(searchTerm)
    );
    setFilteredCars(filtered);
  }

  useEffect(() => {
    handleSearchCar();
  }, [input]);

  function handleImageLoad(id: string) {
    setLoadImages((prevImages) => [...prevImages, id]);
  }

  return (
    <Container>
      <section className="bg-white p-4 rounded-lg w-full mx-w-3xl mx-auto flex justify-center items-center gap-2">
        <input
          className="w-full border-2 rounded-lg h-9 px-3 outline-none"
          placeholder="Digite o nome do carro..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="bg-custom h-9 px-8 rounded-lg text-white font-medium text-lg"
          onClick={handleSearchCar}
        >
          Buscar
        </button>
      </section>

      <h1 className="font-bold text-center mt-6 text 2xl mb-4">Carros novos e usados em todo o Brasil!</h1>

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCars.map(car => (
          <Link key={car.id} to={`/car/${car.id}`}>
            <section className="w-full bg-white rounded-lg">
              <div
                className="w-full h-72 rounded-lg bg-slate-200"
                style={{ display: loadImages.includes(car.id) ? "none" : "block" }}
              ></div>
              <img
                className="w-full rounded-lg mb-2 max-h-72 hover:scale-105 transition-all"
                src={car.images[0].url}
                alt="Carro"
                onLoad={() => handleImageLoad(car.id)}
                style={{ display: loadImages.includes(car.id) ? "block" : "none" }}
              />
              <p className="font-bold mt-1 mb-2 px-2">{car.name}</p>

              <div className="flex flex-col px-2">
                <span className="text-zinc-700 mb-6">Ano {car.year} | {car.km} Km</span>
                <strong className="text-black font-medium text-xl">R$ {car.price}</strong>
              </div>

              <div className="w-full h-px bg-slate-200 my-2"></div>

              <div className="px-2 pb-2">
                <span className="text-black">{car.city}</span>
              </div>
            </section>
          </Link>
        ))}
      </main>
    </Container>
  );
}
