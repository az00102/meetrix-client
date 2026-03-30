import type { HTMLInputTypeAttribute } from "react";

type AuthFieldProps = {
  id: string;
  label: string;
  type?: HTMLInputTypeAttribute;
  placeholder: string;
  autoComplete?: string;
};

function AuthField({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
}: AuthFieldProps) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
      />
    </label>
  );
}

export { AuthField };
