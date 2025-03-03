'use client'
import SignUpForm from "@/components/auth/SignUpForm";
import Link from "next/link";

function Page() {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="w-96 bg-background rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Sign Up</h1>
        <SignUpForm />
      </div>
      <div className="w-96 p-6">
        <span>Already have an account? <Link href="/login" className="text-blue-500 hover:text-blue-600">Sign in</Link></span>
      </div>
    </div>
  );
}

export default Page;
