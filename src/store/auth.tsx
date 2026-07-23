import { useState, useEffect, createContext, useContext } from "react"
import { supabase, Profile } from "../lib/supabase"

interface AuthContextType {
  user: any | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  isAdmin: boolean
  isApproved: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      try {
        setUser(session?.user ?? null)
        if (session?.user) {
          loadProfile(session.user.id)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error("Initial session load error:", error)
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    }).catch((error) => {
      console.error("Failed to get session:", error)
      setUser(null)
      setProfile(null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      } catch (error) {
        console.error("Auth state change error:", error)
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
      if (error || !data) {
        const { data: authData } = await supabase.auth.getUser()
        const email = authData.user?.email || ""
        await supabase.from("profiles").upsert({
          id: userId,
          email,
          full_name: "",
          role: "user",
          status: "pending",
        })
        setProfile({
          id: userId,
          email,
          full_name: "",
          role: "user",
          status: "pending",
          approved_at: null,
          created_at: new Date().toISOString(),
        })
      } else {
        setProfile(data as Profile)
      }
    } catch (error) {
      console.error("Failed to load profile:", error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) return { error }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        email,
        full_name: fullName,
        role: "user",
        status: "pending",
      })
    }
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      isAdmin: profile?.role === "admin",
      isApproved: profile?.status === "approved",
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
