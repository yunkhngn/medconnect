"use client";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function BacSiIndexRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/bac-si/trang-chu"); }, []);
  return null;
}
