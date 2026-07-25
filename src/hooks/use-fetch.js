import { useSession } from "@clerk/clerk-react";
import { useCallback, useEffect, useRef, useState } from "react";

const useFetch = (cb, options = {}) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const optionsRef = useRef(options);

  const { session } = useSession();

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const fn = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const supabaseAccessToken = await session.getToken({
        template: "supabase",
      });
      const response = await cb(supabaseAccessToken, optionsRef.current, ...args);
      setData(response);
      setError(null);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [cb, session]);

  return { data, loading, error, fn };
};

export default useFetch;
