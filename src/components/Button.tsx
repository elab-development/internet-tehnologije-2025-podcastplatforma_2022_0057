type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ children, className, ...props }: Props) {
  return (
    <button
      {...props}
      className={`px-6 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition ${className}`}
    >
      {children}
    </button>
  );
}
