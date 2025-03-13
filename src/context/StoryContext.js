'use client'

import { createContext, useContext, useState, useEffect } from 'react';

// Create the story context
const StoryContext = createContext({
  storyUnits: [],
  setStoryUnits: () => {},
  processedUnits: [],
  setProcessedUnits: () => {},
  storyType: null,
  setStoryType: () => {},
  generatedStory: null,
  setGeneratedStory: () => {},
  storyData: null,
  setStoryData: () => {},
  clearStoryData: () => {},
});

// Custom hook to access the story context
export const useStoryContext = () => useContext(StoryContext);

export function StoryProvider({ children }) {
  // State for story units (raw input from user)
  const [storyUnits, setStoryUnits] = useState([]);
  
  // State for processed units (after processing)
  const [processedUnits, setProcessedUnits] = useState([]);
  
  // State for story type (article, blog, etc.)
  const [storyType, setStoryType] = useState(null);
  
  // State for generated story text
  const [generatedStory, setGeneratedStory] = useState(null);
  
  // State for complete story data object
  const [storyData, setStoryData] = useState(null);

  // Function to clear all story data
  const clearStoryData = () => {
    setStoryUnits([]);
    setProcessedUnits([]);
    setGeneratedStory(null);
    setStoryData(null);
  };

  // Provide the story context to child components
  return (
    <StoryContext.Provider 
      value={{ 
        storyUnits, 
        setStoryUnits, 
        processedUnits, 
        setProcessedUnits,
        storyType,
        setStoryType,
        generatedStory,
        setGeneratedStory,
        storyData,
        setStoryData,
        clearStoryData
      }}
    >
      {children}
    </StoryContext.Provider>
  );
} 