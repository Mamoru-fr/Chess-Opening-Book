import { useState } from "react";
import { EyeButton } from "../EyeButton";
import { cn } from "@/utils/cn";

type Props = {
    placeholder: string;
    className?: string;
    type: string;
    value?: string;
    onChange?: (value: string) => void;
    name?: string;
    required?: boolean;
};

export function Input({ placeholder, className, type, value, onChange, name, required }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
        <div className="relative w-full">
            <input
                className={cn(
                    "w-full rounded-xl border border-[#4a463f] px-4 py-3.5 md:px-5 md:py-4",
                    "text-base md:text-lg outline-none transition-all duration-200",
                    "bg-[#1f1d1b] text-[#f4f1ea] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
                    "placeholder:text-[#8f8a80] focus:border-[#81b64c] focus:ring-2 focus:ring-[#81b64c]/20",
                    isPassword && "pr-12",
                    className
                )}
                placeholder={placeholder}
                type={inputType}
                name={name}
                required={required}
                {...(value !== undefined && { value })}
                {...(onChange && { onChange: (e) => onChange(e.target.value) })}
            />
            <EyeButton
                isPassword={isPassword}
                showPassword={showPassword}
                ShowPassword={setShowPassword}
            />
        </div>
    );
}