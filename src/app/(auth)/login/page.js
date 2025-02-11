'use client'
import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";

function Page() {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="w-96 bg-background rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Sign In</h1>
        <LoginForm />
      </div>
      <div className="w-96 p-6">
        <span>Don't have an account? <Link href="/signup" className="text-blue-500 hover:text-blue-600">Sign up</Link></span>
      </div>
    </div>
  );
}

export default Page;
