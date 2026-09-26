"use client";

import EyeIcon from "./EyeIcon";

type PasswordInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder: string;
  autoComplete: string;
};

export default function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
  autoComplete,
}: PasswordInputProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="
            w-full
            rounded-lg
            border
            border-slate-300
            px-3
            py-2
            pr-11
            outline-none
            transition
            focus:border-black
            focus:ring-1
            focus:ring-black
          "
        />

        <button
          type="button"
          onClick={onToggle}
          className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-slate-500
            hover:text-slate-800
          "
          aria-label={
            show
              ? `Sembunyikan ${label.toLowerCase()}`
              : `Tampilkan ${label.toLowerCase()}`
          }
        >
          <EyeIcon hidden={!show} />
        </button>
      </div>
    </div>
  );
}