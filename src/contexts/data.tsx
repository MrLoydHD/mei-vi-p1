import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import { HappinessData, LastYearData } from "@/lib/types";

type DataProviderProps = {
    children: React.ReactNode;
};

type DataProviderState = {
    timeSeriesData: HappinessData[];
    lastYearData: LastYearData[];
    setTimeSeriesData: (data: HappinessData[]) => void;
    setLastYearData: (data: LastYearData[]) => void;
    isLoading: boolean;
};

const initialState: DataProviderState = {
    timeSeriesData: [],
    lastYearData: [],
    setTimeSeriesData: () => {},
    setLastYearData: () => {},
    isLoading: true,
};

export const DataProviderContext = createContext<DataProviderState>(initialState);

const safeParseFloat = (value: string | undefined): number | undefined => {
  if (value === undefined || value === "") return undefined;
  // Replace comma with dot for proper parsing
  const parsedValue = parseFloat(value.replace(',', '.'));
  return isNaN(parsedValue) ? undefined : parsedValue;
};

export const DataProvider = ({ children }: DataProviderProps) => {
    const [timeSeriesData, setTimeSeriesData] = useState<HappinessData[]>([]);
    const [lastYearData, setLastYearData] = useState<LastYearData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                console.log("Fetching Data");
                const [timeSeriesResponse, lastYearResponse] = await Promise.all([
                    d3.csv<HappinessData>('/data_over_the_years.csv'),
                    d3.csv<LastYearData>('/data_last_year.csv')
                ]);

                const parsedTimeSeriesData = timeSeriesResponse.map((d, index) => {
                    const parsed = {
                        'Country name': d['Country name'],
                        year: safeParseFloat(d.year),
                        'Life Ladder': safeParseFloat(d['Life Ladder']),
                        'Log GDP per capita': safeParseFloat(d['Log GDP per capita']),
                        'Social support': safeParseFloat(d['Social support']),
                        'Healthy life expectancy at birth': safeParseFloat(d['Healthy life expectancy at birth']),
                        'Freedom to make life choices': safeParseFloat(d['Freedom to make life choices']),
                        Generosity: safeParseFloat(d.Generosity),
                        'Perceptions of corruption': safeParseFloat(d['Perceptions of corruption']),
                        'Positive affect': safeParseFloat(d['Positive affect']),
                        'Negative affect': safeParseFloat(d['Negative affect'])
                    };

                    Object.entries(parsed).forEach(([key, value]) => {
                        if (value === undefined) {
                            console.warn(`TimeSeries: Row ${index}, Column "${key}" is undefined. Original value: "${d[key as keyof HappinessData]}"`);
                        }
                    });

                    return parsed;
                });

                const parsedLastYearData = lastYearResponse.map((d, index) => {
                    const parsed = {
                        'Country name': d['Country name'],
                        'Ladder score': safeParseFloat(d['Ladder score']),
                        upperwhisker: safeParseFloat(d.upperwhisker),
                        lowerwhisker: safeParseFloat(d.lowerwhisker),
                        'Explained by: Log GDP per capita': safeParseFloat(d['Explained by: Log GDP per capita']),
                        'Explained by: Social support': safeParseFloat(d['Explained by: Social support']),
                        'Explained by: Healthy life expectancy': safeParseFloat(d['Explained by: Healthy life expectancy']),
                        'Explained by: Freedom to make life choices': safeParseFloat(d['Explained by: Freedom to make life choices']),
                        'Explained by: Generosity': safeParseFloat(d['Explained by: Generosity']),
                        'Explained by: Perceptions of corruption': safeParseFloat(d['Explained by: Perceptions of corruption']),
                        'Dystopia + residual': safeParseFloat(d['Dystopia + residual'])
                    };

                    Object.entries(parsed).forEach(([key, value]) => {
                        if (value === undefined) {
                            console.warn(`LastYear: Row ${index}, Column "${key}" is undefined. Original value: "${d[key as keyof LastYearData]}"`);
                        }
                    });

                    return parsed;
                });

                console.log("Data Fetched");
                console.log(parsedLastYearData);

                setTimeSeriesData(parsedTimeSeriesData);
                setLastYearData(parsedLastYearData);
                
                console.log("Data Fetched and Parsed");
            } catch (error) {
                console.error("Error fetching data:", error);
            }
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const value = useMemo(() => ({
        timeSeriesData,
        lastYearData,
        setTimeSeriesData,
        setLastYearData,
        isLoading
    }), [timeSeriesData, lastYearData, isLoading]);

    return (
        <DataProviderContext.Provider value={value}>
            {children}
        </DataProviderContext.Provider>
    );
}

export const useData = () => {
    const context = useContext(DataProviderContext);
    if (!context) throw new Error("useData must be used within a DataProvider");
    return context;
}