import { useEffect, useMemo, useState } from "react";

// react-hook-form keeps field errors until the field is valid again. This
// hides them a few seconds after they appear, so they only tell the user
// what is wrong and then get out of the way. Submitting again (or editing
// a field into a new error) shows them again.
//
//   const { errors, submitCount } = formState;
//   const visibleErrors = useTransientErrors(errors, submitCount);
export const useTransientErrors = (errors, submitCount = 0, delay = 4000) => {
  const [hidden, setHidden] = useState(false);

  // Changes whenever an error message appears or changes, but not on
  // unrelated re-renders (errors is a new object each time)
  const signature = useMemo(
    () =>
      Object.entries(errors)
        .map(([name, error]) => `${name}:${error?.message}`)
        .join("|"),
    [errors],
  );

  useEffect(() => {
    if (!signature) return undefined;

    setHidden(false);
    const timer = setTimeout(() => setHidden(true), delay);
    return () => clearTimeout(timer);
  }, [signature, submitCount, delay]);

  return hidden ? {} : errors;
};
