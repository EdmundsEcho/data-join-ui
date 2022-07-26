/**
 * This context provider hosts a single flag:
 *
 *      Status
 *
 */
import React, { useState, useContext, createContext } from 'react'

// consumer interface
export const STATUS = {
  empty: 'empty',
  loaded: 'loaded',
  stale: 'stale',
}

const StatusContext = createContext({ status: STATUS.empty })
StatusContext.displayName = 'StatusContext'

function StatusProvider({ children }) {
  const [status, setStatus] = useState(() => STATUS.empty)

  // exposed interface
  const value = {
    status,
    STATUS,
    setStatus,
    isStatusEmpty: () => status === STATUS.empty,
    isStatusStale: () => status === STATUS.stale,
    isStatusLoaded: () => status === STATUS.loaded,
    setStatusLoaded: () => setStatus(STATUS.loaded),
    setStatusStale: () => setStatus(STATUS.stale),
  }

  if (true) {
    console.debug(
      `%c📥 cache status context is running: ${status || 'undefined status'}`,
      'color: cyan',
    )
  }
  return (
    <StatusContext.Provider value={value}>{children}</StatusContext.Provider>
  )
}

function useStatus() {
  const context = useContext(StatusContext)
  if (context === undefined) {
    throw new Error('useStatus must be used within a StatusProvider')
  }
  return context
}

export { StatusProvider, useStatus }
