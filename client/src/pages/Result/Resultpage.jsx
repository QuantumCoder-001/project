import { useLocation, useNavigate } from "react-router-dom";
import "./Result.css";

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const { predictions, symptoms, predictionType, userData, xrayImage } = state;

  if (!predictions) {
    return (
      <div className="container">
        <div className="card">
          <h2 className="sectionTitle" style={{color: '#1e293b'}}>No prediction data found.</h2>
          <button className="navBtn" onClick={() => navigate("/health-form")}>Go Back</button>
        </div>
      </div>
    );
  }

  const unwrapData = (data) => {
    if (!data) return {};
    if (typeof data === "string") {
      try {
        return unwrapData(JSON.parse(data));
      } catch (e) {
        return {};
      }
    }
    if (data.disease) return data;
    if (Array.isArray(data) && data.length > 0) return unwrapData(data[0]);
    if (data.data) return unwrapData(data.data);
    if (data.predictions) return unwrapData(data.predictions);
    if (data.prediction) return unwrapData(data.prediction);
    return data;
  };

  const topPrediction = unwrapData(predictions);
  const recs = topPrediction?.recommendation;

  return (
    <div className="container">
      <h1 className="mainTitle">Medical Analysis Report</h1>

      {predictionType === "xray" && xrayImage && (
        <div className="card">
          <h2 className="sectionTitle">Chest X-ray Visualization</h2>
          <div className="xrayContainer">
            <img src={xrayImage} alt="X-ray" className="xrayImage" />
            <p className="imageSubtext">Processed via MobileNetV2 Feature Extraction</p>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="sectionTitle">
          {predictionType === "xray" ? "Radiological Findings" : "Clinical Assessment"}
        </h2>

        <div className="predictionBox">
          <div className="diseaseName">{topPrediction?.disease || "Unknown Condition"}</div>
          <div className="confidence">Confidence Score: {topPrediction?.confidence || "0%"}</div>
          <div className={`statusBadge ${parseFloat(topPrediction?.confidence || 0) > 85 ? 'urgent' : 'stable'}`}>
            Condition Status: {parseFloat(topPrediction?.confidence || 0) > 85 ? "Action Required" : "Monitor"}
          </div>
        </div>

        {recs?.clinical_context && (
            <div className="contextBox">
                <strong>Medical Context:</strong> {recs.clinical_context}
            </div>
        )}

        <div className="actionPlanHeader">🩺 Professional Action Plan</div>

        <div className="grid">
          <div className="infoBox">
            <div className="boxTitle">🥗 Nutritional Guidance</div>
            <div className="boxContent">{recs?.diet || "Balanced nutrition required."}</div>
          </div>
          <div className="infoBox">
            <div className="boxTitle">🏃 Lifestyle Protocol</div>
            <div className="boxContent">{recs?.lifestyle || "Activity modification advised."}</div>
          </div>
        </div>

        <div className="grid" style={{marginTop: '15px'}}>
             <div className="infoBox secondary">
                <div className="boxTitle">⚠️ Contraindications</div>
                <div className="boxContent">{recs?.precautions || "Standard precautions apply."}</div>
            </div>
            <div className="infoBox secondary">
                <div className="boxTitle">📅 Recommended Follow-up</div>
                <div className="boxContent">{recs?.next_steps || "Consult your primary physician."}</div>
            </div>
        </div>
      </div>

      <div className="card">
        <h2 className="sectionTitle">Patient Profile</h2>
        <div className="gridThreeCols">
          <div className="dataItem"><strong>Age:</strong> {userData?.age || "N/A"}</div>
          <div className="dataItem"><strong>BP:</strong> {userData?.bp || "N/A"}</div>
          <div className="dataItem"><strong>Source:</strong> {predictionType?.toUpperCase() || "N/A"}</div>
        </div>

        {predictionType === "symptoms" && symptoms?.length > 0 && (
          <div className="symptomWrapper">
            <p style={{marginBottom: '8px', color: '#475569'}}><strong>Reported Symptoms:</strong></p>
            <div className="badgeContainer">
                {symptoms.map((s, i) => <span key={i} className="badge">{s}</span>)}
            </div>
          </div>
        )}
      </div>

      <div className="btnGroup">
        <button className="navBtn primary" onClick={() => navigate("/health-form")}>New Prediction</button>
        <button className="navBtn secondary" onClick={() => window.print()}>Export PDF</button>
      </div>

      <p className="disclaimer">
        *Disclaimer: This is an AI-generated assessment for educational use. It is not a substitute for professional medical diagnosis.
      </p>
    </div>
  );
};

export default Result;