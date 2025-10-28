"use client"
import { useEffect } from 'react';

const useScrollIntoView = (sectionId: string) => {
	useEffect(() => {
		if (!sectionId) return;
		
		// Small delay to ensure DOM is ready
		const timer = setTimeout(() => {
			const element = document.getElementById(sectionId);
			if (element) {
				element.scrollIntoView({ 
					behavior: 'smooth', 
					block: 'center',
					inline: 'nearest'
				});
			}
		}, 100);

		return () => clearTimeout(timer);
	}, [sectionId]);

	return null;
};

export default useScrollIntoView;
