import { cn } from "@/utils/cn";

type Props = {
    content: string;
    className?: string;
    variant?: 'primary' | 'secondary';
    onClick?: () => void;
}

export function Button({ content, className, variant = 'primary', onClick }: Props) {
    return (
        <button 
            className={cn(
                "flex-1 min-w-0 rounded-xl px-4 py-3 md:px-6 md:py-3.5 lg:px-7 lg:py-4",
                "text-sm md:text-base font-semibold tracking-[0.02em]",
                "border transition-all duration-200",
                "whitespace-nowrap overflow-hidden text-ellipsis",
                variant === 'primary' && [
                    "border-[#6a9d3f] bg-[#81b64c] text-[#111]",
                    "shadow-[0_8px_20px_rgba(129,182,76,0.25)]",
                    "hover:bg-[#95c95c] hover:border-[#95c95c]",
                    "active:scale-[0.99]"
                ],
                variant === 'secondary' && [
                    "border-[#4a463f] bg-[#312d29] text-[#f4f1ea]",
                    "shadow-[0_6px_18px_rgba(0,0,0,0.22)]",
                    "hover:border-[#81b64c] hover:bg-[#37332f]",
                    "active:scale-[0.99]"
                ],
                className
            )}
            onClick={onClick}
        >
            {content}
        </button>
    );
}