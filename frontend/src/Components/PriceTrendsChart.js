import React, { useState, useEffect } from "react";
import { Card, Form } from "react-bootstrap";
import {
  ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line
} from "recharts";

const PriceTrendsChart = ({ 
  activeChartVeg, 
  dynamicChartData, 
  isForecasting, 
  financialImpact, 
  forecastProduct 
}) => {
  const isStandalone = !dynamicChartData; // Checks if it's on the Pricing tab
  
  const [localVeg, setLocalVeg] = useState("");
  const [localData, setLocalData] = useState([]);
  const [localImpact, setLocalImpact] = useState(null);

  // 1. Expanded Historical Database for ALL requested vegetables
  const historicalDatabase = {
    Pumpkin: [ { month: 'Jan', HistoricalPrice: 80 }, { month: 'Feb', HistoricalPrice: 75 }, { month: 'Mar', HistoricalPrice: 90 }, { month: 'Apr', HistoricalPrice: 110 }, { month: 'May', HistoricalPrice: 105 }, { month: 'Jun', HistoricalPrice: 95 } ],
    Tomato: [ { month: 'Jan', HistoricalPrice: 150 }, { month: 'Feb', HistoricalPrice: 120 }, { month: 'Mar', HistoricalPrice: 110 }, { month: 'Apr', HistoricalPrice: 180 }, { month: 'May', HistoricalPrice: 210 }, { month: 'Jun', HistoricalPrice: 190 } ],
    Carrot: [ { month: 'Jan', HistoricalPrice: 280 }, { month: 'Feb', HistoricalPrice: 260 }, { month: 'Mar', HistoricalPrice: 240 }, { month: 'Apr', HistoricalPrice: 300 }, { month: 'May', HistoricalPrice: 320 }, { month: 'Jun', HistoricalPrice: 290 } ],
    Cabbage: [ { month: 'Jan', HistoricalPrice: 180 }, { month: 'Feb', HistoricalPrice: 170 }, { month: 'Mar', HistoricalPrice: 160 }, { month: 'Apr', HistoricalPrice: 190 }, { month: 'May', HistoricalPrice: 200 }, { month: 'Jun', HistoricalPrice: 210 } ],
    Onion: [ { month: 'Jan', HistoricalPrice: 300 }, { month: 'Feb', HistoricalPrice: 290 }, { month: 'Mar', HistoricalPrice: 310 }, { month: 'Apr', HistoricalPrice: 350 }, { month: 'May', HistoricalPrice: 330 }, { month: 'Jun', HistoricalPrice: 340 } ],
    "Brinjal (Eggplant)": [ { month: 'Jan', HistoricalPrice: 160 }, { month: 'Feb', HistoricalPrice: 140 }, { month: 'Mar', HistoricalPrice: 130 }, { month: 'Apr', HistoricalPrice: 180 }, { month: 'May', HistoricalPrice: 200 }, { month: 'Jun', HistoricalPrice: 190 } ],
    Okra: [ { month: 'Jan', HistoricalPrice: 140 }, { month: 'Feb', HistoricalPrice: 130 }, { month: 'Mar', HistoricalPrice: 150 }, { month: 'Apr', HistoricalPrice: 170 }, { month: 'May', HistoricalPrice: 160 }, { month: 'Jun', HistoricalPrice: 145 } ],
    Beans: [ { month: 'Jan', HistoricalPrice: 350 }, { month: 'Feb', HistoricalPrice: 320 }, { month: 'Mar', HistoricalPrice: 300 }, { month: 'Apr', HistoricalPrice: 400 }, { month: 'May', HistoricalPrice: 420 }, { month: 'Jun', HistoricalPrice: 380 } ],
    Cucumber: [ { month: 'Jan', HistoricalPrice: 100 }, { month: 'Feb', HistoricalPrice: 90 }, { month: 'Mar', HistoricalPrice: 85 }, { month: 'Apr', HistoricalPrice: 120 }, { month: 'May', HistoricalPrice: 130 }, { month: 'Jun', HistoricalPrice: 110 } ],
    Radish: [ { month: 'Jan', HistoricalPrice: 120 }, { month: 'Feb', HistoricalPrice: 115 }, { month: 'Mar', HistoricalPrice: 110 }, { month: 'Apr', HistoricalPrice: 140 }, { month: 'May', HistoricalPrice: 135 }, { month: 'Jun', HistoricalPrice: 125 } ],
    Leeks: [ { month: 'Jan', HistoricalPrice: 220 }, { month: 'Feb', HistoricalPrice: 200 }, { month: 'Mar', HistoricalPrice: 190 }, { month: 'Apr', HistoricalPrice: 250 }, { month: 'May', HistoricalPrice: 270 }, { month: 'Jun', HistoricalPrice: 240 } ],
    Spinach: [ { month: 'Jan', HistoricalPrice: 90 }, { month: 'Feb', HistoricalPrice: 85 }, { month: 'Mar', HistoricalPrice: 80 }, { month: 'Apr', HistoricalPrice: 110 }, { month: 'May', HistoricalPrice: 120 }, { month: 'Jun', HistoricalPrice: 100 } ],
    Potato: [ { month: 'Jan', HistoricalPrice: 200 }, { month: 'Feb', HistoricalPrice: 190 }, { month: 'Mar', HistoricalPrice: 180 }, { month: 'Apr', HistoricalPrice: 220 }, { month: 'May', HistoricalPrice: 240 }, { month: 'Jun', HistoricalPrice: 230 } ],
    Beetroot: [ { month: 'Jan', HistoricalPrice: 250 }, { month: 'Feb', HistoricalPrice: 230 }, { month: 'Mar', HistoricalPrice: 210 }, { month: 'Apr', HistoricalPrice: 280 }, { month: 'May', HistoricalPrice: 300 }, { month: 'Jun', HistoricalPrice: 270 } ]
  };

  useEffect(() => {
    if (!isStandalone || !localVeg) return;

    // Fetch historical data for the selected crop
    const baseData = historicalDatabase[localVeg] || [];
    if (baseData.length === 0) return;
    
    let combinedData = [...baseData];

    // 2. THIS IS WHERE IT READS YOUR DECLARATIONS!
    const savedDeclarations = JSON.parse(localStorage.getItem("declarations")) || [];
    
    // Filter declarations to match the selected vegetable exactly
    const cropDeclarations = savedDeclarations.filter(d => 
      d.product && d.product.toLowerCase() === localVeg.toLowerCase()
    );

    let totalUnits = 0;
    cropDeclarations.forEach(d => totalUnits += (parseFloat(d.units) || 0));

    // 3. Prediction Logic based on the Total Units declared
    if (cropDeclarations.length > 0) {
      const lastPrice = baseData[baseData.length - 1].HistoricalPrice;
      let predictedPrice = lastPrice;
      let state = "";

      // If a lot of farmers declare this crop -> Oversupply -> Price Drops
      if (totalUnits > 500) {
        predictedPrice = lastPrice * 0.75; 
        state = "oversupply";
      } 
      // If a moderate amount is declared -> Balanced -> Slight Increase
      else if (totalUnits > 100) {
        predictedPrice = lastPrice * 1.05; 
        state = "balanced";
      } 
      // If very few farmers declare this crop -> Shortage -> Price Spikes
      else {
        predictedPrice = lastPrice * 1.30; 
        state = "shortage";
      }

      setLocalImpact({ state });
      
      // Draw the prediction line to the next month
      combinedData.push({ month: 'Jul (Est)', PredictedPrice: predictedPrice, HistoricalPrice: null });
      combinedData[combinedData.length - 2].PredictedPrice = lastPrice; 
    } else {
      // If there are no declarations for this crop, clear the impact so no line is drawn
      setLocalImpact(null);
    }

    setLocalData(combinedData);
  }, [localVeg, isStandalone]);

  const displayVeg = isStandalone ? localVeg : activeChartVeg;
  const displayData = isStandalone ? localData : dynamicChartData;
  const displayForecasting = isStandalone ? !!localImpact : isForecasting;
  const displayImpact = isStandalone ? localImpact : financialImpact;
  const displayForecastProduct = isStandalone ? localVeg : forecastProduct;

  return (
    <Card className="p-4 shadow-sm border-0 rounded-4 mt-3 container">
      <h4 className="mb-1" style={{ color: "#1B5E20" }}>📈 Historical Price Trends vs Predictions</h4>
      
      {isStandalone && (
        <Form.Group className="mt-3 mb-3" style={{ maxWidth: "300px" }}>
          <Form.Select 
            value={localVeg} 
            onChange={(e) => setLocalVeg(e.target.value)}
            className="shadow-none border-secondary"
          >
            <option value="">-- Choose a Crop --</option>
            {Object.keys(historicalDatabase).map((vegName) => (
              <option key={vegName} value={vegName}>{vegName}</option>
            ))}
          </Form.Select>
        </Form.Group>
      )}

      <p className="text-muted mb-3 mt-2">
        Showing seasonal data for: <strong>{displayVeg || "Select a crop"}</strong>
      </p>
      
      {!displayData || displayData.length === 0 ? (
         <div className="text-center text-muted p-5 bg-light rounded-3">
            📊 No pricing data available. Please select a vegetable or run a forecast.
         </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis label={{ value: 'Rs / kg', angle: -90, position: 'insideLeft' }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Legend />
            
            <Line type="monotone" dataKey="HistoricalPrice" name="Historical Average" stroke="#1B5E20" strokeWidth={3} dot={{ r: 4 }} />
            
            {displayForecasting && displayImpact && displayVeg === displayForecastProduct && (
              <Line 
                type="monotone" 
                dataKey="PredictedPrice" 
                name={`Predicted ${displayImpact.state === 'oversupply' ? 'Drop' : 'Spike'}`} 
                stroke={displayImpact.state === 'oversupply' ? "#dc3545" : "#28a745"} 
                strokeWidth={3} 
                strokeDasharray="5 5" 
                dot={{ r: 6, fill: displayImpact.state === 'oversupply' ? "#dc3545" : "#28a745" }} 
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default PriceTrendsChart;