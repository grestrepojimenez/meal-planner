"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const useScrollIntoView = (sectionId: string) => {
	const router = useRouter();

	useEffect(() => {
		// Navegar a la URL que contiene el identificador de la sección
		router.push(`/#${sectionId}`);

	}, [router, sectionId]);

	return null;
};

export default useScrollIntoView;
