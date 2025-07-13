'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  Heart, 
  Droplets, 
  Moon, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  Target,
  RefreshCw
} from 'lucide-react'

interface HealthDashboard {
  metrics: any[]
  insights: any[]
  vitalSigns: any
  sleepData: any
  stressLevels: any[]
  hydrationEntries: any[]
  monthlyTrends: any
  weeklyStats: any
}

interface HealthInsightsProps {
  profile: any
}

export default function HealthInsights({ profile }: HealthInsightsProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [dashboard, setDashboard] = useState<HealthDashboard | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchHealthDashboard = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/health/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch health dashboard')
      }
      
      const result = await response.json()
      if (result.success) {
        setDashboard(result.dashboard)
      } else {
        setError(result.error || 'Failed to load health dashboard')
      }
    } catch (err) {
      console.error('Error fetching health dashboard:', err)
      setError('Unable to load health dashboard. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthDashboard()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-lg">Loading health insights...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <AlertTriangle className="h-12 w-12 text-orange-500" />
        <p className="text-lg text-center">{error}</p>
        <Button onClick={fetchHealthDashboard} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Activity className="h-12 w-12 text-gray-400" />
        <p className="text-lg text-center">No health data available</p>
        <p className="text-sm text-muted-foreground text-center">
          Start tracking your health metrics to see insights here
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Health Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">
            Track your health metrics and discover insights
          </p>
        </div>
        <Button onClick={fetchHealthDashboard} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Recent Metrics Cards */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weight</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboard.metrics?.find(m => m.type === 'weight')?.value || '--'} kg
                </div>
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/50 dark:to-red-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                <Heart className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboard.vitalSigns?.heartRate || '--'} BPM
                </div>
                <p className="text-xs text-muted-foreground">
                  Resting rate
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hydration</CardTitle>
                <Droplets className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboard.hydrationEntries?.reduce((sum, entry) => sum + entry.amount, 0) || 0}L
                </div>
                <p className="text-xs text-muted-foreground">
                  Today's intake
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sleep</CardTitle>
                <Moon className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboard.sleepData?.duration || '--'}h
                </div>
                <p className="text-xs text-muted-foreground">
                  Last night
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Quick Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.insights?.slice(0, 3).map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Badge variant="outline" className="mt-1">
                      {insight.type}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{insight.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {insight.priority} priority
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground">
                    No insights available yet. Keep tracking your metrics!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboard.metrics?.slice(0, 5).map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{metric.type}</Badge>
                        <div>
                          <p className="text-sm font-medium">
                            {metric.value} {metric.unit}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(metric.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground">
                      No metrics recorded yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Health Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Daily Water Intake</span>
                      <span>2.5L / 3L</span>
                    </div>
                    <Progress value={83} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sleep Goal</span>
                      <span>7h / 8h</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Weight Goal</span>
                      <span>72kg / 70kg</span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Weekly Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weight</span>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">-0.5kg</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sleep Quality</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">+5%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Stress Level</span>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">-2 points</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Monthly Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Weight</span>
                    <span className="text-sm font-medium">72.3kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Sleep</span>
                    <span className="text-sm font-medium">7.2h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Hydration Days</span>
                    <span className="text-sm font-medium">18/30</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  Personalized Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {dashboard.insights?.map((insight, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{insight.type}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {insight.message}
                          </p>
                        </div>
                        <Badge variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'default' : 'secondary'}>
                          {insight.priority}
                        </Badge>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">
                        No insights available yet. Keep tracking your metrics to get personalized recommendations!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
