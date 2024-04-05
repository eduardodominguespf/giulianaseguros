import { signOut } from "firebase/auth"
import { Link } from "react-router-dom"
import { auth } from "../../services/firebaseConnection"

export function DashboardHeader(){

    async function handleLogOut() {
        await signOut(auth);
    }

    return(
        <div className="w-full items-center flex h-10 bg-custom rounded-lg text-white font-medium gap-4 px-4 mb-4">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/dashboard/new">Cadastrar</Link>

            <button className="ml-auto" onClick={handleLogOut}>Sair</button>
        </div>
    )
}