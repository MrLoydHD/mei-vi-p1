import { Suspense} from 'react';
import { CleanLayout } from './layouts/CleanLayout';
import HomePage from './pages/HomePage';
import InfoPage from './pages/InfoPage';

export const routes = [
    {
        path: '/',
        element: <CleanLayout />,
        children: [
            {
                path: '/',
                element: (
                    <Suspense fallback={<div>Loading....</div>}>
                        <HomePage />
                    </Suspense>
                )
            },
            {
                path: '/info',
                element: (
                    <Suspense fallback={<div>Loading...</div>}>
                        <InfoPage />
                    </Suspense>
                )
            }
        ]
    }
]
