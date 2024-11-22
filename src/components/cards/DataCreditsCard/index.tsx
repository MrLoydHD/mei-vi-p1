import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink } from 'lucide-react'

export default function DataCreditsCard() {
  return (
    <Card className="w-full border-primary">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          Data Credits
          <ExternalLink className="w-5 h-5 text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm font-medium">
          All data presented in this dashboard is sourced from:
        </p>
        <div className="bg-background p-4 rounded-md border border-primary/20">
          <p className="text-base font-semibold text-primary">
            World Happiness Report 2024
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Helliwell, J. F., Layard, R., Sachs, J. D., De Neve, J.-E., Aknin, L. B., & Wang, S. (Eds.). (2024).
          </p>
          <p className="text-sm text-muted-foreground">
            University of Oxford: Wellbeing Research Centre.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          We extend our gratitude to the authors and the team behind the World Happiness Report for making this valuable data available for analysis and visualization.
        </p>
        <p className="text-sm">
          For more information, please visit the official{' '}
          <a 
            href="https://worldhappiness.report/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            World Happiness Report
          </a> website.
        </p>
      </CardContent>
    </Card>
  )
}