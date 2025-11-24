import { FieldError, UseFormRegister } from "react-hook-form";

type SelectFieldProps = {
  label: string;
  register?: UseFormRegister<any>;
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  defaultValue?: string;
  error?: FieldError;
  hidden?: boolean;
  className?: string;
  children: React.ReactNode;
};

const SelectField = ({
  label,
  register,
  name,
  value,
  onChange,
  defaultValue,
  error,
  hidden,
  className = "w-full md:w-1/4",
  children,
}: SelectFieldProps) => {
  return (
    <div className={hidden ? "hidden" : `flex flex-col gap-2 ${className}`}>
      <label className="text-xs text-gray-500">{label}</label>
      <select
        {...(register ? register(name) : {})}
        value={value}
        onChange={onChange}
        defaultValue={defaultValue}
        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
      >
        {children}
      </select>
      {error?.message && (
        <p className="text-xs text-red-400">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default SelectField;
