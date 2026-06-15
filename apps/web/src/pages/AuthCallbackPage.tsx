import { useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { useAuth } from "../contexts/AuthContext"
import { authApi, type RefreshResponse } from "../api/auth"

export default function AuthCallbackPage() {
  const { setTokenAndUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const ran = useRef(false)

  // Code exchange is a mutation (writes a session cookie), not a read — keep the
  // API call inside mutationFn so React Query owns the server interaction.
  const exchange = useMutation({
    mutationFn: (code: string) => authApi.exchange(code),
    onSuccess: ({ accessToken, user }: RefreshResponse) => {
      setTokenAndUser(accessToken, user)

      const inviteNext = sessionStorage.getItem("invite_next")
      if (inviteNext) {
        sessionStorage.removeItem("invite_next")
        try {
          const url = new URL(inviteNext)
          if (url.origin === window.location.origin) {
            navigate(url.pathname + url.search, { replace: true })
            return
          }
        } catch {
          // Malformed URL — fall through
        }
      }

      navigate(user.onboardingCompleted ? "/dashboard" : "/onboarding", { replace: true })
    },
    onError: () => {
      navigate("/login?error=auth_failed", { replace: true })
    },
  })

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const code = new URLSearchParams(location.search).get("code")
    if (!code) {
      navigate("/login?error=auth_failed", { replace: true })
      return
    }
    exchange.mutate(code)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "oklch(var(--color-paper))",
        color: "oklch(var(--color-ink-2))",
        fontSize: "0.875rem",
      }}
    >
      Signing you in…
    </div>
  )
}
