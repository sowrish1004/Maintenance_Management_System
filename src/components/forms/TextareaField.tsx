import { FieldError, UseFormRegister } from "react-hook-form";

type TextareaFieldProps = {
  label: string;
  register: UseFormRegister<any>;
  name: string;
  defaultValue?: string;
  error?: FieldError;
  placeholder?: string;
  hidden?: boolean;
  className?: string;
};

const TextareaField = ({
  label,
  register,
  name,
  defaultValue,
  error,
  placeholder,
  hidden,
  className = "w-full",
}: TextareaFieldProps) => {
  return (
    <div
      className={
        hidden ? "hidden" : `flex flex-col gap-2 ${className}` 
      }
    >
      <label className="text-xs text-gray-500">{label}</label>
      <textarea
        {...register(name)}
        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full min-h-[100px] resize-none"
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
      {error?.message && (
        <p className="text-xs text-red-400">
          {error.message.toString()}
        </p>
      )}
    </div>
  );
};

export default TextareaField;