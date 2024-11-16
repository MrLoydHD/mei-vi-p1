import { Card, CardContent } from "@/components/ui/card"

export default function InfoPage() {
  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-red-700">
          World Happiness Report - Dataset Information
        </h1>
        <p className="text-lg text-gray-700">
          The World Happiness Report (WHR) is a comprehensive study that ranks countries by their happiness levels, based on data collected through the Gallup World Poll. The dataset includes metrics such as GDP per capita, social support, healthy life expectancy, freedom to make life choices, generosity, and perceptions of corruption.
        </p>

        <h2 className="text-2xl font-semibold text-red-700 mt-8">
          Key Metrics Explained
        </h2>
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-bold text-primary">GDP per Capita:</h3>
              <p className="text-gray-700">
                Measured in terms of purchasing power parity (PPP), adjusted to 2017 international dollars. This metric reflects a country's economic strength and its correlation to happiness levels.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-bold text-primary">Social Support:</h3>
              <p className="text-gray-700">
                Represents the average response to the question, "If you were in trouble, do you have relatives or friends you can count on to help you?"
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-bold text-primary">Healthy Life Expectancy:</h3>
              <p className="text-gray-700">
                Based on data from the World Health Organization, it measures the average number of years a person is expected to live in good health.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-bold text-primary">Freedom to Make Life Choices:</h3>
              <p className="text-gray-700">
                The national average of responses to the question, "Are you satisfied with your freedom to choose what you do with your life?"
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-bold text-primary">Generosity:</h3>
              <p className="text-gray-700">
                Derived from responses to the question, "Have you donated money to a charity in the past month?" adjusted for GDP per capita.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-bold text-primary">Perception of Corruption:</h3>
              <p className="text-gray-700">
                The average of responses to questions about whether corruption is widespread in government or business.
              </p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-semibold text-red-700 mt-8">
          Objectives of the World Happiness Report
        </h2>
        <p className="text-lg text-gray-700">
          The WHR aims to evaluate the quality of life using well-being indicators, guide public policies by identifying key drivers of happiness, and increase global awareness of factors influencing life satisfaction.
        </p>
      </div>
    </div>
  )
}