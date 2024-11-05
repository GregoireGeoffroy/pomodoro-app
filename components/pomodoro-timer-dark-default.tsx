'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bell, Sun, Moon, Settings } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const themes = [
  { name: 'Default', bg: 'bg-gray-100', dark: 'dark:bg-gray-900', accent: 'bg-blue-500' },
  { name: 'Nature', bg: 'bg-green-100', dark: 'dark:bg-green-900', accent: 'bg-green-500' },
  { name: 'Ocean', bg: 'bg-blue-100', dark: 'dark:bg-blue-900', accent: 'bg-blue-500' },
  { name: 'Sunset', bg: 'bg-orange-100', dark: 'dark:bg-orange-900', accent: 'bg-orange-500' },
]

export function PomodoroTimerDarkDefault() {
  const [totalSeconds, setTotalSeconds] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [isWork, setIsWork] = useState(true)
  const [progress, setProgress] = useState(0)
  const [workDuration, setWorkDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0)
  const [totalFocusedTime, setTotalFocusedTime] = useState(0)
  const [currentTheme, setCurrentTheme] = useState(themes[0])
  const [isDarkMode, setIsDarkMode] = useState(true)

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const totalDuration = isWork ? workDuration * 60 : breakDuration * 60
  const progressPercentage = ((totalDuration - totalSeconds) / totalDuration) * 100


  // Load settings from localStorage
  useEffect(() => {
    const storedSettings = localStorage.getItem('pomodoroSettings')
    if (storedSettings) {
      const { workDuration, breakDuration, pomodorosCompleted, totalFocusedTime, themeIndex, isDarkMode } = JSON.parse(storedSettings)
      setWorkDuration(workDuration)
      setBreakDuration(breakDuration)
      setPomodorosCompleted(pomodorosCompleted)
      setTotalFocusedTime(totalFocusedTime)
      setCurrentTheme(themes[themeIndex])
      setIsDarkMode(isDarkMode)
    }
    resetTimer(isWork)
  }, [])

  // Debounce `localStorage` update to avoid excessive writes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('pomodoroSettings', JSON.stringify({
        workDuration,
        breakDuration,
        pomodorosCompleted,
        totalFocusedTime,
        themeIndex: themes.findIndex(theme => theme.name === currentTheme.name),
        isDarkMode,
      }))
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [workDuration, breakDuration, pomodorosCompleted, totalFocusedTime, currentTheme, isDarkMode])


  
  // Countdown timer logic
  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setTotalSeconds((prev) => {
        if (prev > 1) return prev - 1
        clearInterval(interval)
        playAlarm()
        if (isWork) {
          setPomodorosCompleted((count) => count + 1)
          setTotalFocusedTime((time) => time + workDuration)
        }
        switchMode()
        return prev
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, isWork, workDuration, breakDuration])

  // Update document title with timer
  useEffect(() => {
    document.title = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} - ${isWork ? 'Work' : 'Break'}`
    
    // Reset title when the component unmounts
    return () => {
      document.title = "Pomodoro Timer"
    }
  }, [minutes, seconds, isWork])

  const toggleTimer = () => {
    setIsActive((prev) => !prev)
  }

  const switchMode = useCallback(() => {
    const newMode = !isWork
    setIsWork(newMode)
    resetTimer(newMode)
  }, [isWork, workDuration, breakDuration])

  const resetTimer = (isWorkMode: boolean) => {
    setIsActive(false)
    setTotalSeconds(isWorkMode ? workDuration * 60 : breakDuration * 60)
    setProgress(0)
  }

  const playAlarm = () => {
    const audio = new Audio('/alarm.mp3')
    audio.play()
  }

  const handleDurationChange = (isWorkMode: boolean) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (isNaN(value) || value <= 0) return
    if (isWorkMode) {
      setWorkDuration(value)
      if (isWork) resetTimer(true)
    } else {
      setBreakDuration(value)
      if (!isWork) resetTimer(false)
    }
  }

  const toggleTheme = () => setIsDarkMode((prev) => !prev)

  const changeTheme = () => {
    setCurrentTheme((prev) => {
      const currentIndex = themes.findIndex(theme => theme.name === prev.name)
      return themes[(currentIndex + 1) % themes.length]
    })
  }


  return (
    <div className={`flex items-center justify-center min-h-screen ${currentTheme.bg} ${isDarkMode ? currentTheme.dark : ''} transition-colors duration-300`}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {isWork ? 'Work Time' : 'Break Time'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-6xl font-bold text-center mb-6">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <Progress value={progressPercentage} className={`w-full mb-6 ${currentTheme.accent}`} />
          <div className="flex justify-center space-x-4 mb-6">
            <Button onClick={toggleTimer} className={currentTheme.accent}>
              {isActive ? 'Pause' : 'Start'}
            </Button>
            <Button onClick={() => resetTimer(isWork)} variant="outline">
              Reset
            </Button>
            <Button onClick={switchMode} variant="outline">
              {isWork ? 'Take a Break' : 'Start Working'}
            </Button>
          </div>
          <div className="text-center mb-6">
            <p>Pomodoros Completed Today: {pomodorosCompleted}</p>
            <p>Total Focused Time: {totalFocusedTime} minutes</p>
          </div>
          <div className="flex justify-center space-x-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Pomodoro Settings</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="workDuration" className="text-right">
                      Work Duration
                    </Label>
                    <Input
                      id="workDuration"
                      type="number"
                      value={workDuration}
                      onChange={handleDurationChange(true)}
                      min="1"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="breakDuration" className="text-right">
                      Break Duration
                    </Label>
                    <Input
                      id="breakDuration"
                      type="number"
                      value={breakDuration}
                      onChange={handleDurationChange(false)}
                      min="1"
                      className="col-span-3"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <Button onClick={toggleTheme} variant="outline">
                      {isDarkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </Button>
                    <Button onClick={changeTheme} variant="outline">
                      Change Theme
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
      <Bell className="absolute bottom-4 right-4 text-gray-400" size={24} />
    </div>
  )
}
