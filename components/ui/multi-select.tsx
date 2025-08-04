import { Command as CommandPrimitive } from "cmdk";
import { X } from "lucide-react";
import React, { forwardRef, useCallback, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export interface Option {
    value: string;
    label: string;
    disable?: boolean;
    /** fixed option will not be removed when clear */
    fixed?: boolean;
    /** Whether to hide the checkbox */
    hideCheckbox?: boolean;
}

interface MultiSelectProps {
    options: Option[];
    value: Option[];
    onChange: React.Dispatch<React.SetStateAction<Option[]>>;
    onSearch?: (value: string) => Promise<Option[]>;
    placeholder?: string;
    maxSelected?: number;
    maxSelectedMessage?: string;
    onMaxSelected?: (max: number) => void;
    disabled?: boolean;
    className?: string;
}

export const MultiSelect = forwardRef<HTMLButtonElement, MultiSelectProps>(({
    options,
    value,
    onChange,
    onSearch,
    placeholder = "Select options",
    maxSelected,
    maxSelectedMessage = "You have reached the maximum number of selections",
    onMaxSelected,
    disabled,
    className,
}, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectables, setSelectables] = useState<Option[]>(options);

    const handleUnselect = useCallback(
        (option: Option) => {
            onChange((prev) => prev.filter((s) => s.value !== option.value));
        },
        [onChange]
    );

    const handleSelect = useCallback(
        (option: Option) => {
            onChange((prev) => {
                if (maxSelected && prev.length >= maxSelected) {
                    onMaxSelected?.(maxSelected);
                    return prev;
                }
                // check if option is already selected
                if (prev.some((s) => s.value === option.value)) {
                    return prev;
                }
                return [...prev, option];
            });
        },
        [maxSelected, onChange, onMaxSelected]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            const input = inputRef.current;
            if (input) {
                if (e.key === "Delete" || e.key === "Backspace") {
                    if (input.value === "") {
                        const lastSelected = value[value.length - 1];
                        if (lastSelected && !lastSelected.fixed) {
                            handleUnselect(lastSelected);
                        }
                    }
                }
                if (e.key === "Escape") {
                    input.blur();
                }
            }
        },
        [handleUnselect, value]
    );

    const handleSearch = async (search: string) => {
        if (!onSearch) {
            setSelectables(options.filter(option => option.label.toLowerCase().includes(search.toLowerCase())));
            return;
        };
        setIsLoading(true);
        const res = await onSearch(search);
        setSelectables(res);
        setIsLoading(false);
    };

    const selectedValues = new Set(value.map((v) => v.value));

    return (
        <Command onKeyDown={handleKeyDown} className="overflow-visible bg-transparent">
            <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <div className="flex flex-wrap gap-1">
                    {value.map((option) => (
                        <Badge
                            key={option.value}
                            variant="secondary"
                            className={cn(
                                "rounded-sm",
                                option.fixed && "cursor-not-allowed"
                            )}
                        >
                            {option.label}
                            <button
                                className={cn(
                                    "ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                    option.fixed && "hidden"
                                )}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleUnselect(option);
                                    }
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onClick={() => handleUnselect(option)}
                            >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                        </Badge>
                    ))}
                    <CommandPrimitive.Input
                        ref={inputRef}
                        placeholder={placeholder}
                        className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                        onValueChange={handleSearch}
                        onBlur={() => setIsOpen(false)}
                        onFocus={() => setIsOpen(true)}
                        disabled={disabled}
                    />
                </div>
            </div>
            <div className="relative mt-2">
                {isOpen && (selectables.length > 0 || isLoading) ? (
                    <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                        <CommandGroup className="h-full overflow-auto">
                            {isLoading ? (
                                <CommandItem onSelect={() => { }}>
                                    <span className="animate-pulse">Loading...</span>
                                </CommandItem>
                            ) : (
                                selectables.map((option) => {
                                    const isSelected = selectedValues.has(option.value);
                                    return (
                                        <CommandItem
                                            key={option.value}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onSelect={() => {
                                                if (isSelected) {
                                                    handleUnselect(option);
                                                } else {
                                                    handleSelect(option);
                                                }
                                            }}
                                            className={cn(
                                                "cursor-pointer",
                                                isSelected && "font-bold"
                                            )}
                                            disabled={option.disable}
                                        >
                                            {option.label}
                                        </CommandItem>
                                    )
                                })
                            )}
                        </CommandGroup>
                    </div>
                ) : null}
            </div>
        </Command>
    );
});