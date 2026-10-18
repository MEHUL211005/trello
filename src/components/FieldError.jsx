// Inline validation message shown under a field
const FieldError = ({ error }) => {
  if (!error?.message) return null;

  return (
    <p role="alert" className="mt-1 text-sm text-red-500">
      {error.message}
    </p>
  );
};

export default FieldError;
