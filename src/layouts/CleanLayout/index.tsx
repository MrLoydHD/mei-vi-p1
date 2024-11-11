import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

const CleanLayout = () => {
    return (
        <div className="bg-background text-foreground flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">                
                <Outlet />
            </main>
        </div>
    )
}

export { CleanLayout }