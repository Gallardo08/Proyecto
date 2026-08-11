import * as React from "react";

import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  uppercase?: boolean;
}

const shouldUppercaseInput = (type?: string, uppercase = true) => {
  return uppercase && type !== "email" && type !== "password" && type !== "number" && type !== "file";
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onChange, uppercase = true, ...props }, ref) => {
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
      if (shouldUppercaseInput(type, uppercase) && typeof event.target.value === "string") {
        event.target.value = event.target.value.toUpperCase();
      }

      onChange?.(event);
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        onChange={handleChange}
        style={shouldUppercaseInput(type, uppercase) ? { textTransform: "uppercase" } : undefined}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
