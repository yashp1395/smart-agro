from flask import Flask, request, render_template, jsonify
from flask_cors import CORS
# Alternatively can use Django, FastAPI, or anything similar
from src.pipeline.prediction_pipeline import CustomData, PredictPipeline

application = Flask(__name__)
app = application
CORS(app)  # Enable CORS for all routes

@app.route('/')
def home_page():
    return render_template('index.html')  # Pass final_result to template

@app.route('/predict', methods=['POST', "GET"])
def predict_datapoint():
    if request.method == "GET":
        return render_template("form.html")
    else:
        data = CustomData(
            N=float(request.form.get('N')),
            P=float(request.form.get('P')),
            K=float(request.form.get("K")),
            pH=float(request.form.get("pH")),
            rainfall=float(request.form.get("rainfall")),
            temperature=float(request.form.get("temperature")),
            Area_in_hectares=float(request.form.get('Area_in_hectares')),
            State_Name=request.form.get("State_Name"),
            Crop_Type=request.form.get("Crop_Type"),
            Crop=request.form.get("Crop")
        )

        new_data = data.get_data_as_dataframe()
        predict_pipeline = PredictPipeline()
        pred = predict_pipeline.predict(new_data)

        production = round(pred[0], 2)
        yield_value = round(production / data.Area_in_hectares, 2)  # Calculate yield

        # Pass final_result and yield_value to index.html
        final_result = f"Predicted Crop Production: {production} tons"
        yield_result = f"Predicted Yield: {yield_value} tons/hectare"

        return render_template("index.html", final_result=final_result, yield_result=yield_result)


@app.route('/api/predict', methods=['POST', 'OPTIONS'])
def api_predict():
    """JSON API endpoint for crop yield prediction - used by smart-agro frontend"""
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    try:
        json_data = request.get_json()
        
        data = CustomData(
            N=float(json_data.get('N')),
            P=float(json_data.get('P')),
            K=float(json_data.get('K')),
            pH=float(json_data.get('pH')),
            rainfall=float(json_data.get('rainfall')),
            temperature=float(json_data.get('temperature')),
            Area_in_hectares=float(json_data.get('Area_in_hectares')),
            State_Name=json_data.get('State_Name'),
            Crop_Type=json_data.get('Crop_Type'),
            Crop=json_data.get('Crop')
        )
        
        new_data = data.get_data_as_dataframe()
        predict_pipeline = PredictPipeline()
        pred = predict_pipeline.predict(new_data)
        
        production = round(pred[0], 2)
        yield_value = round(production / data.Area_in_hectares, 2)
        
        return jsonify({
            'success': True,
            'production': production,
            'yield_per_hectare': yield_value,
            'unit': 'tons',
            'area': data.Area_in_hectares,
            'crop': data.Crop
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'crop-prediction-api'})


if __name__ == "__main__":
    app.run(debug=True, port=5000)


