'use client';

// React Imports
import {useState, useEffect} from 'react';

// Hooks Imports
// i18n translation hook
import {useTranslation} from 'react-i18next';

// Utils
import {cn} from '@/utils/cn';

// Data Imports
import languageList from '@/services/languageList.json';

type Props = {
    className?: string;
};

export function LanguageDropdown({className}: Props) {
    const {i18n} = useTranslation();
    const [windowWidth, setWindowWidth] = useState(0);

    useEffect(() => {
        // Set initial language from localStorage or default to 'en'
        i18n.changeLanguage(localStorage.getItem('preferredLanguage') || 'en');
        // Set initial width
        setWindowWidth(window.innerWidth);

        // Update width on resize
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const languageCode = e.target.value;
        i18n.changeLanguage(languageCode);
        localStorage.setItem('preferredLanguage', languageCode);
    };

    return (
        <div 
            className={cn(
                "fixed left-6 md:left-7 lg:left-8",
                "w-25 md:w-30 lg:w-32.5",
                "h-12.5",
                "z-50",
                windowWidth <= 500 ? "bottom-28" : windowWidth <= 940 ? "bottom-32" : "bottom-10",
                className
            )}
        >
            <select
                className={cn(
                    "w-full h-full max-h-12.5 rounded-xl border border-[#4a463f]",
                    "px-3 py-2.5 md:px-4 md:py-3",
                    "text-xs md:text-sm lg:text-base font-semibold",
                    "bg-[#262421]/95 text-[#f4f1ea] backdrop-blur-[12px]",
                    "outline-none cursor-pointer",
                    "shadow-[0_10px_28px_rgba(0,0,0,0.3)]",
                    "transition-all duration-200 hover:border-[#81b64c] hover:bg-[#2d2926]",
                )}
                value={i18n.language}
                onChange={handleLanguageChange}
            >
                {Object.entries(languageList).map(([code, lang]) => (
                    <option key={code} value={code}>
                        {lang.flag} {lang.abbreviation}
                    </option>
                ))}
            </select>
        </div>
    );
}