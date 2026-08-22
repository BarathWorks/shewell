interface IUIFormInput extends React.InputHTMLAttributes<HTMLInputElement> {}

const AddFormInput = ({ type, placeholder, ...props }: IUIFormInput) => {
  return (
    <>
      <input
        style={{ border: "1px solid rgba(233,233,233, 1)" }}
        className=" rounded-md py-[11px] pl-[14px] w-full font-inter text-sm font-normal placeholder:font-inter placeholder:text-sm placeholder:font-normal text-active placeholder:text-muted outline-primary"
        type={type}
        placeholder={placeholder}
        {...props}
      />
    </>
  );
};

export default AddFormInput;
