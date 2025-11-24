'use client'

import * as Clerk from '@clerk/elements/common'
import * as SignIn from '@clerk/elements/sign-in'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'


const LoginPage = () => {

  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()

  useEffect(() => {
    const role = user?.publicMetadata.role;
    if (role) {
      router.push(`/${role}`)
    }
  }, [user, router])


  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[url('/background.jpg')] bg-cover bg-center">

      <div className="absolute inset-0 opacity-50"></div>

      <SignIn.Root>
        <SignIn.Step
          name="start"
          className="relative z-10 flex flex-col gap-5 w-[90%] max-w-sm p-8
                       rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 
                       shadow-xl text-white"
        >
          {/* Header */}
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Image src="/logo.png" alt="Logo" width={28} height={28} />
              MaintXperts
            </h1>
            <p className="text-gray-300 text-sm">Sign in to continue</p>
          </div>

          <Clerk.GlobalError className="text-red-400 text-sm text-center" />

          <Clerk.Field name="identifier" className="flex flex-col gap-2">
            <Clerk.Label className="text-sm text-gray-200">
              Email
            </Clerk.Label>
            <Clerk.Input
              type="email"
              required
              placeholder="user@maintxperts.com"
              className="w-full p-2.5 rounded-md bg-white/15 border border-white/30 
                           placeholder-gray-300 text-white focus:outline-none 
                           focus:ring-2 focus:ring-blue-400"
            />
            <Clerk.FieldError className="text-red-400 text-xs" />
          </Clerk.Field>

          <Clerk.Field name="password" className="flex flex-col gap-2">
            <Clerk.Label className="text-sm text-gray-200">Password</Clerk.Label>
            <Clerk.Input
              type="password"
              required
              placeholder="•••••••••••"
              className="w-full p-2.5 rounded-md bg-white/15 border border-white/30 
                           placeholder-gray-300 text-white focus:outline-none 
                           focus:ring-2 focus:ring-blue-400"
            />
            <Clerk.FieldError className="text-red-400 text-xs" />
          </Clerk.Field>

          <SignIn.Action
            submit
            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 transition-colors 
                         text-white font-medium py-2.5 rounded-md shadow-md"
          >
            Sign In
          </SignIn.Action>
        </SignIn.Step>
      </SignIn.Root>
    </div>
  )
}

export default LoginPage