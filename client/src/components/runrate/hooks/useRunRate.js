import { useEffect, useState, useCallback } from "react";
import { getRunRate } from "../../../services/runRateService";

export const useRunRateData = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getRunRate();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err.message || "Failed to fetch run rate data");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, loading, refetch: fetchData };
};
