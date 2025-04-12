"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica de autenticación real
    console.log({ email, password, name, isLogin })

    // Simulamos un login exitoso y redirigimos al chat
    router.push("/chat")
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">{isLogin ? "Log in to your account" : "Create a free account"}</h1>
        <p className="text-gray-500">
          {isLogin ? "Access your AI assistant" : "Your smart assistant for everyday tasks."}
        </p>
      </div>

      {!isLogin && (
        <div className="mb-6">
          <Button
            variant="outline"
            className="w-full py-6 flex items-center justify-center gap-2 border border-gray-300 rounded-full"
            onClick={() => {
              // Google sign up logic
              router.push("/chat")
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </Button>
        </div>
      )}

      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative">
          <span className="bg-white px-4 text-sm text-gray-500">OR</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name*
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 rounded-md border border-gray-300"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email*
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded-md border border-gray-300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password*
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded-md border border-gray-300"
          />
        </div>

        <Button type="submit" className="w-full py-6 bg-black text-white rounded-full hover:bg-gray-800">
          {isLogin ? "Log in" : "Sign up"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        {isLogin ? (
          <p>
            Don&apos;t have an account?{" "}
            <button onClick={() => setIsLogin(false)} className="text-blue-600 hover:underline">
              Sign up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <button onClick={() => setIsLogin(true)} className="text-blue-600 hover:underline">
              Log in
            </button>
          </p>
        )}
      </div>

      <div className="mt-8 text-center text-xs text-gray-500">
        <p>
          By creating an account, you agree to our{" "}
          <Link href="#" className="underline">
            terms of use
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
