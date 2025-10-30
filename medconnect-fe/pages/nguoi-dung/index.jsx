"use client";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function NguoiDungIndexRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/nguoi-dung/trang-chu"); }, []);
  return null;
}
