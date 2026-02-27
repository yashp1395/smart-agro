import sys 
import os 
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from exception import CustomException 
from logger import logging 
from utils import load_obj
import pandas as pd
import numpy as np

# Average yield data (tons/hectare) for different crops - used for mock predictions
CROP_YIELD_DATA = {
    "Rice": {"base_yield": 3.5, "n_factor": 0.02, "p_factor": 0.015, "k_factor": 0.01},
    "Wheat": {"base_yield": 3.2, "n_factor": 0.025, "p_factor": 0.012, "k_factor": 0.008},
    "Maize": {"base_yield": 4.0, "n_factor": 0.022, "p_factor": 0.018, "k_factor": 0.012},
    "Soyabean": {"base_yield": 1.8, "n_factor": 0.01, "p_factor": 0.02, "k_factor": 0.015},
    "Cotton(lint)": {"base_yield": 1.5, "n_factor": 0.015, "p_factor": 0.02, "k_factor": 0.018},
    "Groundnut": {"base_yield": 1.6, "n_factor": 0.012, "p_factor": 0.022, "k_factor": 0.014},
    "Arhar/Tur": {"base_yield": 0.9, "n_factor": 0.008, "p_factor": 0.015, "k_factor": 0.01},
    "Urad": {"base_yield": 0.7, "n_factor": 0.006, "p_factor": 0.012, "k_factor": 0.008},
    "Moong(Green Gram)": {"base_yield": 0.6, "n_factor": 0.005, "p_factor": 0.01, "k_factor": 0.007},
    "Sugarcane": {"base_yield": 70.0, "n_factor": 0.3, "p_factor": 0.2, "k_factor": 0.25},
    "Gram": {"base_yield": 1.0, "n_factor": 0.008, "p_factor": 0.015, "k_factor": 0.01},
    "Masoor": {"base_yield": 0.8, "n_factor": 0.006, "p_factor": 0.012, "k_factor": 0.008},
    "Rapeseed &Mustard": {"base_yield": 1.2, "n_factor": 0.01, "p_factor": 0.018, "k_factor": 0.012},
    "Sunflower": {"base_yield": 1.1, "n_factor": 0.012, "p_factor": 0.016, "k_factor": 0.01},
    "Barley": {"base_yield": 2.8, "n_factor": 0.02, "p_factor": 0.012, "k_factor": 0.01},
    "Potato": {"base_yield": 22.0, "n_factor": 0.15, "p_factor": 0.1, "k_factor": 0.12},
    "Onion": {"base_yield": 18.0, "n_factor": 0.1, "p_factor": 0.12, "k_factor": 0.1},
    "Tomato": {"base_yield": 25.0, "n_factor": 0.12, "p_factor": 0.15, "k_factor": 0.1},
}

class PredictPipeline: 
    def __init__(self) -> None:
        self.use_mock = False
        preprocessor_path = os.path.join('dataset', 'preprocessor.pkl')
        model_path = os.path.join('dataset', 'model.pkl')
        
        # Check if model files exist
        if not os.path.exists(preprocessor_path) or not os.path.exists(model_path):
            logging.info("Model files not found. Using mock prediction mode.")
            self.use_mock = True
        else:
            try:
                self.preprocessor = load_obj(preprocessor_path)
                self.model = load_obj(model_path)
            except Exception as e:
                logging.info(f"Failed to load models: {e}. Using mock prediction mode.")
                self.use_mock = True

    def predict(self, features): 
        try:
            if self.use_mock:
                return self._mock_predict(features)
            
            data_scaled = self.preprocessor.transform(features)
            pred = self.model.predict(data_scaled)
            return pred
        except Exception as e: 
            logging.info("Error occured in predict function in prediction_pipeline location")
            raise CustomException(e,sys)
    
    def _mock_predict(self, features):
        """Generate realistic mock predictions based on input parameters"""
        row = features.iloc[0]
        crop = row['Crop']
        area = row['Area_in_hectares']
        n = row['N']
        p = row['P']
        k = row['K']
        ph = row['pH']
        rainfall = row['rainfall']
        temperature = row['temperature']
        
        # Get crop-specific base yield or use default
        crop_data = CROP_YIELD_DATA.get(crop, {"base_yield": 2.0, "n_factor": 0.015, "p_factor": 0.015, "k_factor": 0.01})
        
        # Calculate yield based on soil nutrients
        base_yield = crop_data["base_yield"]
        n_effect = (n - 40) * crop_data["n_factor"]  # Nitrogen effect (optimal ~40-60)
        p_effect = (p - 40) * crop_data["p_factor"]  # Phosphorus effect
        k_effect = (k - 40) * crop_data["k_factor"]  # Potassium effect
        
        # pH effect (optimal 6.0-7.0)
        ph_effect = -0.1 * abs(ph - 6.5) * base_yield
        
        # Rainfall effect (varies by crop, simplified)
        optimal_rainfall = 800
        rainfall_effect = -0.0001 * abs(rainfall - optimal_rainfall) * base_yield
        
        # Temperature effect (optimal 25-30°C for most crops)
        temp_effect = -0.02 * abs(temperature - 27) * base_yield
        
        # Calculate final yield per hectare
        yield_per_ha = base_yield + n_effect + p_effect + k_effect + ph_effect + rainfall_effect + temp_effect
        yield_per_ha = max(0.1, yield_per_ha)  # Ensure positive yield
        
        # Add some randomness (+/- 10%)
        yield_per_ha *= (0.9 + np.random.random() * 0.2)
        
        # Total production
        production = yield_per_ha * area
        
        logging.info(f"Mock prediction: {production:.2f} tons for {crop} on {area} hectares")
        return np.array([production])
        
class CustomData: 
        def __init__(self, N:float, 
                     P:float, 
                     K:float, 
                     pH:float, 
                     rainfall:float, 
                     temperature:float, 
                     Area_in_hectares:float,
                     State_Name:str, 
                     Crop_Type:str, 
                     Crop:str): 
             self.N = N
             self.P = P
             self.K = K
             self.pH = pH
             self.rainfall = rainfall 
             self.temperature = temperature
             self.Area_in_hectares = Area_in_hectares
             self.State_Name = State_Name 
             self.Crop_Type = Crop_Type 
             self.Crop = Crop
        
        def get_data_as_dataframe(self): 
             try: 
                  custom_data_input_dict = {
                       'N': [self.N], 
                       'P': [self.P], 
                       'K': [self.K], 
                       'pH': [self.pH],
                       'rainfall':[self.rainfall],
                       'temperature':[self.temperature], 
                       'Area_in_hectares':[self.Area_in_hectares],
                       'State_Name': [self.State_Name], 
                       'Crop_Type': [self.Crop_Type], 
                       'Crop': [self.Crop]

                  }
                  df = pd.DataFrame(custom_data_input_dict)
                  logging.info("Dataframe created")
                  return df
             except Exception as e:
                  logging.info("Error occured in get_data_as_dataframe function in prediction_pipeline")
                  raise CustomException(e,sys) 
             
             
        