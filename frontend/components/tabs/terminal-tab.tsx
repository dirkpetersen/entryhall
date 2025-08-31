"use client"

import { useEffect, useRef, useState } from "react"
import "@xterm/xterm/css/xterm.css"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Terminal as TerminalIcon, AlertCircle } from "lucide-react"

export function TerminalTab() {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<any>(null)
  const fitAddonRef = useRef<any>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [bastionHost, setBastionHost] = useState("bastion.yourcomputer.edu")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !terminalRef.current) return

    const initTerminal = async () => {
      const { Terminal } = await import("@xterm/xterm")
      const { FitAddon } = await import("@xterm/addon-fit")

      const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: "Menlo, Monaco, 'Courier New', monospace",
        theme: {
          background: "#1e1e1e",
          foreground: "#d4d4d4",
          cursor: "#aeafad",
          black: "#000000",
          red: "#cd3131",
          green: "#0dbc79",
          yellow: "#e5e510",
          blue: "#2472c8",
          magenta: "#bc3fbc",
          cyan: "#11a8cd",
          white: "#e5e5e5",
          brightBlack: "#666666",
          brightRed: "#f14c4c",
          brightGreen: "#23d18b",
          brightYellow: "#f5f543",
          brightBlue: "#3b8eea",
          brightMagenta: "#d670d6",
          brightCyan: "#29b8db",
          brightWhite: "#e5e5e5",
        },
      })

      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      
      if (terminalRef.current) {
        term.open(terminalRef.current)
        fitAddon.fit()
      }

      xtermRef.current = term
      fitAddonRef.current = fitAddon

      term.writeln("Welcome to Woerk Terminal")
      term.writeln("Click 'Connect' to establish SSH connection to bastion host")
      term.writeln("")

      const handleResize = () => {
        fitAddon.fit()
      }
      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
        term.dispose()
      }
    }

    initTerminal()
  }, [isClient])

  const connectToBastion = async () => {
    if (!xtermRef.current) return

    setIsConnected(true)
    if (xtermRef.current?.writeln) {
      xtermRef.current.writeln(`Connecting to ${bastionHost}...`)
    }
    
    try {
      const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3020'}/terminal`)
      
      ws.onopen = () => {
        if (xtermRef.current?.writeln) {
          xtermRef.current.writeln("Connected to bastion host!")
          xtermRef.current.writeln("")
        }
        
        if (xtermRef.current?.onData) {
          xtermRef.current.onData((data: string) => {
            ws.send(JSON.stringify({ type: "input", data }))
          })
        }
      }

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data)
        if (message.type === "output" && xtermRef.current?.write) {
          xtermRef.current.write(message.data)
        }
      }

      ws.onerror = (error) => {
        if (xtermRef.current?.writeln) {
          xtermRef.current.writeln(`\r\nConnection error: ${error}`)
        }
        setIsConnected(false)
      }

      ws.onclose = () => {
        if (xtermRef.current?.writeln) {
          xtermRef.current.writeln("\r\nConnection closed")
        }
        setIsConnected(false)
      }
    } catch (error) {
      if (xtermRef.current?.writeln) {
        xtermRef.current.writeln(`Failed to connect: ${error}`)
      }
      setIsConnected(false)
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    if (xtermRef.current?.writeln) {
      xtermRef.current.writeln("\r\nDisconnected from bastion host")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SSH Terminal Access</CardTitle>
          <CardDescription>
            Secure shell access to the bastion host using SSH certificates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="bastionHost">Bastion Host</Label>
              <Input
                id="bastionHost"
                value={bastionHost}
                onChange={(e) => setBastionHost(e.target.value)}
                disabled={isConnected}
                placeholder="bastion.yourcomputer.edu"
              />
            </div>
            <div className="pt-6">
              {!isConnected ? (
                <Button onClick={connectToBastion}>
                  <TerminalIcon className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              ) : (
                <Button variant="destructive" onClick={disconnect}>
                  Disconnect
                </Button>
              )}
            </div>
          </div>

          {!isConnected && (
            <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">
                  SSH Certificate Authentication
                </p>
                <p className="text-yellow-700">
                  Authentication will use your secure SSH certificates stored in the system.
                  Make sure your certificates are properly configured.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isClient ? (
            <div
              ref={terminalRef}
              className="w-full"
              style={{ height: "500px", padding: "10px" }}
            />
          ) : (
            <div className="flex items-center justify-center h-[500px]">
              <p className="text-gray-500">Loading terminal...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}