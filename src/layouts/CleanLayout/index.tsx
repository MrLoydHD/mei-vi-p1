import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

const CleanLayout = () => {
    return (
        <div className="bg-background text-foreground flex flex-col min-h-screen">
            <div className='sticky top-0 z-10'>
                <Navbar />
            </div>
            <main className="flex-grow">                
                <Outlet />
            </main>
        </div>
    )
}

export { CleanLayout }