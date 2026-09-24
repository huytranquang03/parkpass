import { useEffect, useState } from "react";

export type FetchStatus = "loading" | "error" | "success";

export function useFetch<T>(url: string, requestInit?: RequestInit) {
  const [status, setStatus] = useState<FetchStatus>("loading");
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setStatus("loading");
      setData(null);
      setError(null);
      setResponseStatus(null);

      try {
        const response = await fetch(url, {
          ...requestInit,
          signal: controller.signal,
        });
        setResponseStatus(response.status);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const result: T = await response.json();
        setData(result);
        setStatus("success");
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        setData(null);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Không thể tải dữ liệu");
        }
        setStatus("error");
      }
    }
    loadData();
    return () => {
      controller.abort();
    };
  }, [url, requestVersion, requestInit]);

  function refetch() {
    setRequestVersion((currentVersion) => currentVersion + 1);
  }
  return { status, data, error, responseStatus, refetch };
}
