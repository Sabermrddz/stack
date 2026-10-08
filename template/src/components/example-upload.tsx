"use client";

import { useRef, useState } from "react";

type Status = "idle" | "uploading" | "done" | "error";

export function ExampleUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setStatus("uploading");
    setMessage(null);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      });

      const data = (await res.json().catch(() => null)) as {
        url?: string;
        error?: string;
      } | null;

      if (!res.ok || !data?.url) {
        throw new Error(data?.error ?? "Could not get an upload URL");
      }

      const put = await fetch(data.url, {
        method: "PUT",
        headers: { "content-type": file.type },
        body: file,
      });

      if (!put.ok) {
        throw new Error(`Storage rejected the upload (${put.status})`);
      }

      setStatus("done");
      setMessage(`Uploaded ${file.name}`);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Example upload (max 5 MB)
        <input
          ref={inputRef}
          type="file"
          disabled={status === "uploading"}
          onChange={(event) => void handleFileChange(event)}
          className="mt-2 block w-full text-sm text-zinc-600 file:mr-4 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#383838] dark:text-zinc-400 dark:file:bg-white dark:file:text-black dark:hover:file:bg-[#ccc]"
        />
      </label>

      {status === "uploading" ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Uploading…</p>
      ) : null}
      {status === "done" && message ? (
        <p className="text-sm text-green-700 dark:text-green-400">{message}</p>
      ) : null}
      {status === "error" && message ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {message}
        </p>
      ) : null}
    </div>
  );
}
