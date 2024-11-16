import { lazy, Suspense, ReactNode, useEffect, useState } from 'react';
import { CleanLayout } from './layouts/CleanLayout';

const HomePage = lazy(() => import('./pages/HomePage'));
const InfoPage = lazy(() => import('./pages/InfoPage'));

export const routes = [
    {
        path: '/',
        element: <CleanLayout />,
        children: [
            {
                path: '/',
                element: (
                    <Suspense fallback={<div>Loading...</div>}>
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
