import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API, { getSymptoms, predictDisease, predictByReport, predictByXray, checkMLHealth } from "../../services/api";

const HealthForm = () => {
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState("symptoms");

  const [formData, setFormData] = useState({
    age: "",
    temperature: "",
    bp: "",
  });

  const RANGES = {
    glucose: "60-200", cholesterol: "120-300", hemoglobin: "8-18", platelets: "100-450",
    wbc: "3-15", rbc: "3-7", hematocrit: "30-55", mcv: "70-110", mch: "20-40", mchc: "28-38",
    insulin: "2-30", bmi: "15-45", systolic: "90-180", diastolic: "60-110", triglycerides: "50-250",
    hba1c: "4-12", ldl: "50-200", hdl: "20-100", alt: "5-60", ast: "5-60", heartRate: "50-120",
    creatinine: "0.5-2.0", troponin: "0-0.5", crp: "0-20"
  };

  const [reportData, setReportData] = useState(
    Object.keys(RANGES).reduce((acc, key) => ({ ...acc, [key]: "" }), {})
  );

  const [xrayFile, setXrayFile] = useState(null);
  const [xrayPreview, setXrayPreview] = useState(null);
  const [symptomsList, setSymptomsList] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSymptoms, setFilteredSymptoms] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mlStatus, setMlStatus] = useState("checking");
  const [loadingSymptoms, setLoadingSymptoms] = useState(true);

  useEffect(() => {
    checkMLHealthStatus();
    loadSymptoms();
  }, []);

  useEffect(() => {
    if (symptomsList.length > 0) {
      const filtered = symptomsList.filter(s =>
        s.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSymptoms(filtered);
    }
  }, [searchTerm, symptomsList]);

  const checkMLHealthStatus = async () => {
    try {
      const status = await checkMLHealth();
      setMlStatus(status.status === "healthy" || status.status === "online" ? "online" : "offline");
    } catch (err) {
      setMlStatus("offline");
    }
  };

  const loadSymptoms = async () => {
    setLoadingSymptoms(true);
    try {
      const response = await getSymptoms();
      const list = response.symptoms || (Array.isArray(response) ? response : null);
      if (list) {
        setSymptomsList(list);
        setFilteredSymptoms(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSymptoms(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleReportChange = (e) => {
    setReportData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setXrayFile(file);
      setXrayPreview(URL.createObjectURL(file));
    }
  };

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let response;
      if (activeForm === "symptoms") {
        if (selectedSymptoms.length === 0) throw new Error("Select at least one symptom");
        response = await predictDisease(selectedSymptoms, formData);
      } else if (activeForm === "report") {
        response = await predictByReport(reportData, formData);
      } else {
        if (!xrayFile) throw new Error("Please upload an X-ray image");
        response = await predictByXray(xrayFile);
      }

      const resultData = response.data || response;

      navigate("/result", {
        state: {
          predictions: Array.isArray(resultData) ? resultData : [resultData],
          symptoms: activeForm === "symptoms" ? selectedSymptoms : [],
          reportData: activeForm === "report" ? reportData : null,
          xrayImage: activeForm === "xray" ? xrayPreview : null,
          predictionType: activeForm,
          userData: formData
        }
      });
    } catch (err) {
      setError(err.message || "Prediction failed.");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { maxWidth: "750px", margin: "20px auto", padding: "25px", backgroundColor: "#ffffff", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
    title: { fontSize: "24px", color: "#0f172a", fontWeight: "800" },
    toggleContainer: { display: "flex", backgroundColor: "#f1f5f9", borderRadius: "12px", padding: "5px", marginBottom: "25px" },
    toggleBtn: { flex: 1, padding: "12px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", transition: "0.2s" },
    activeToggle: { backgroundColor: "#4f46e5", color: "#ffffff" },
    inactiveToggle: { backgroundColor: "transparent", color: "#64748b" },
    gridContainer: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" },
    formGroup: { marginBottom: "15px" },
    label: { display: "block", marginBottom: "6px", fontWeight: "700", color: "#1e293b", fontSize: "13px" },
    input: { width: "100%", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", boxSizing: "border-box", color: "#000000", backgroundColor: "#f8fafc", fontSize: "15px", outline: "none" },
    rangeText: { fontSize: "11px", color: "#64748b", fontWeight: "400", marginLeft: "5px" },
    button: { width: "100%", padding: "16px", backgroundColor: "#10b981", color: "#ffffff", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "700", cursor: "pointer", marginTop: "20px" },
    error: { color: "#b91c1c", backgroundColor: "#fef2f2", padding: "12px", borderRadius: "8px", marginTop: "15px", border: "1px solid #fee2e2" },
    previewImg: { width: "100%", height: "250px", objectFit: "contain", borderRadius: "12px", marginTop: "15px", border: "2px dashed #e2e8f0" }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Medical Intelligence</h2>
        <div style={{fontSize: '14px', fontWeight: 'bold', color: mlStatus === "online" ? "#10b981" : "#ef4444"}}>
            {mlStatus === "online" ? "● ML ONLINE" : "○ ML OFFLINE"}
        </div>
      </div>

      <div style={styles.toggleContainer}>
        {["symptoms", "report", "xray"].map((type) => (
          <button
            key={type}
            type="button"
            style={{...styles.toggleBtn, ...(activeForm === type ? styles.activeToggle : styles.inactiveToggle)}}
            onClick={() => setActiveForm(type)}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div style={styles.gridContainer}>
            <div style={styles.formGroup}>
                <label style={styles.label}>Patient Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} required style={styles.input} placeholder="Enter Age" />
            </div>
            <div style={styles.formGroup}>
                <label style={styles.label}>Blood Pressure (SYS/DIA)</label>
                <input type="text" name="bp" placeholder="120/80" value={formData.bp} onChange={handleChange} required style={styles.input} />
            </div>
        </div>

        {activeForm === "symptoms" && (
          <div>
             <div style={styles.formGroup}>
                <label style={styles.label}>Body Temperature (°F)</label>
                <input type="number" name="temperature" value={formData.temperature} onChange={handleChange} required step="0.1" style={styles.input} placeholder="98.6" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Select Symptoms ({selectedSymptoms.length})</label>
              <input
                type="text"
                placeholder="🔍 Search symptoms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{...styles.input, marginBottom: '10px'}}
              />
              <div style={{border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px", maxHeight: "350px", overflowY: "auto"}}>
                {loadingSymptoms ? (
                  <p style={{textAlign: 'center', color: '#64748b'}}>Loading...</p>
                ) : (
                  <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px"}}>
                    {filteredSymptoms.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSymptom(s)}
                        style={{padding: "10px", border: "1px solid #e2e8f0", background: selectedSymptoms.includes(s) ? "#4f46e5" : "#ffffff", color: selectedSymptoms.includes(s) ? "#ffffff" : "#475569", borderRadius: "6px", cursor: "pointer", fontSize: "12px", textAlign: "left"}}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeForm === "report" && (
          <div>
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", maxHeight: "400px", overflowY: "auto", padding: "5px"}}>
              {Object.keys(reportData).map((key) => (
                <div key={key} style={styles.formGroup}>
                  <label style={styles.label}>
                    {key.toUpperCase()} <span style={styles.rangeText}>({RANGES[key]})</span>
                  </label>
                  <input type="number" step="0.01" name={key} value={reportData[key]} onChange={handleReportChange} style={styles.input} placeholder="0.0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeForm === "xray" && (
          <div>
             <div style={styles.formGroup}>
                <label style={styles.label}>Chest X-ray Image</label>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{...styles.input, padding: '8px'}} />
                {xrayPreview && <img src={xrayPreview} alt="Preview" style={styles.previewImg} />}
            </div>
          </div>
        )}

        <button type="submit" style={styles.button} disabled={loading || mlStatus === "offline"}>
          {loading ? "Analyzing Data..." : "Run AI Diagnostic"}
        </button>

        {error && <div style={styles.error}>{error}</div>}
      </form>
    </div>
  );
};

export default HealthForm;