import { useEffect } from "react"

const SITE_NAME = "FlowBoard"

/**
 * Sets document.title on mount and restores the default on unmount.
 * Format: "<page> — FlowBoard" or just "FlowBoard" for the landing page.
 */
export function usePageTitle(pageTitle?: string) {
  useEffect(() => {
    const prev = document.title
    document.title = pageTitle
      ? `${pageTitle} — ${SITE_NAME}`
      : `${SITE_NAME} — Real-Time Kanban & Project Management for Teams`
    return () => {
      document.title = prev
    }
  }, [pageTitle])
}
