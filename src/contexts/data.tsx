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
                    d3.csv('/data_over_the_years.csv'),
                    d3.csv('/data_last_year.csv')
                ]);

                const parsedTimeSeriesData = timeSeriesResponse.map((d, index) => {
                    const parsed = {
                        'Country name': d['Country name'],
                        year: safeParseFloat(d.year) ?? 0,
                        'Life Ladder': safeParseFloat(d['Life Ladder']) ?? 0,
                        'Log GDP per capita': safeParseFloat(d['Log GDP per capita']) ?? 0,
                        'Social support': safeParseFloat(d['Social support']) ?? 0,
                        'Healthy life expectancy at birth': safeParseFloat(d['Healthy life expectancy at birth']) ?? 0,
                        'Freedom to make life choices': safeParseFloat(d['Freedom to make life choices']) ?? 0,
                        Generosity: safeParseFloat(d.Generosity) ?? 0,
                        'Perceptions of corruption': safeParseFloat(d['Perceptions of corruption']) ?? 0,
                        'Positive affect': safeParseFloat(d['Positive affect']) ?? 0,
                        'Negative affect': safeParseFloat(d['Negative affect']) ?? 0
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
                        'Ladder score': safeParseFloat(d['Ladder score']) ?? 0,
                        upperwhisker: safeParseFloat(d.upperwhisker) ?? 0,
                        lowerwhisker: safeParseFloat(d.lowerwhisker) ?? 0,
                        'Explained by: Log GDP per capita': safeParseFloat(d['Explained by: Log GDP per capita']) ?? 0,
                        'Explained by: Social support': safeParseFloat(d['Explained by: Social support']) ?? 0,
                        'Explained by: Healthy life expectancy': safeParseFloat(d['Explained by: Healthy life expectancy']) ?? 0,
                        'Explained by: Freedom to make life choices': safeParseFloat(d['Explained by: Freedom to make life choices']) ?? 0,
                        'Explained by: Generosity': safeParseFloat(d['Explained by: Generosity']) ?? 0,
                        'Explained by: Perceptions of corruption': safeParseFloat(d['Explained by: Perceptions of corruption']) ?? 0,
                        'Dystopia + residual': safeParseFloat(d['Dystopia + residual']) ?? 0
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