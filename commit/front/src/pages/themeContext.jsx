import React, { createContext, useState, useContext } from 'react';


const themeContext = createContext();

export const ThemeProvider = ({ children }) => {

    const preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const [theme, setTheme] = useState(preference);

    return (
        <themeContext.Provider value={{ theme, setTheme }}>
            {children}
        </themeContext.Provider>
    );
};


export const usetheme = () => {
    return useContext(themeContext);
};