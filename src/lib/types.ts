export interface HappinessData {
    'Country name': string;
    year: number;
    'Life Ladder': number;
    'Log GDP per capita': number;
    'Social support': number;
    'Healthy life expectancy at birth': number;
    'Freedom to make life choices': number;
    Generosity: number;
    'Perceptions of corruption': number;
    'Positive affect': number;
    'Negative affect': number;
  }
  
export interface LastYearData {
    'Country name': string;
    'Ladder score': number;
    upperwhisker: number;
    lowerwhisker: number;
    'Explained by: Log GDP per capita': number;
    'Explained by: Social support': number;
    'Explained by: Healthy life expectancy': number;
    'Explained by: Freedom to make life choices': number;
    'Explained by: Generosity': number;
    'Explained by: Perceptions of corruption': number;
    'Dystopia + residual': number;
  }