import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API, { getSymptoms, predictDisease, predictByReport, checkMLHealth } from "../services/api";

const HealthForm = () => {
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState("symptoms");

  const [formData, setFormData] = useState({
    age: "",
    temperature: "",
    bp: "",
  });

  const [reportData, setReportData] = useState({
    glucose: "", cholesterol: "", hemoglobin: "", platelets: "",
    wbc: "", rbc: "", hematocrit: "", mcv: "", mch: "", mchc: "",
    insulin: "", bmi: "", systolic: "", diastolic: "", triglycerides: "",
    hba1c: "", ldl: "", hdl: "", alt: "", ast: "", heartRate: "",
    creatinine: "", troponin: "", crp: ""
  });

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
      if (searchTerm.trim() === "") {
        setFilteredSymptoms(symptomsList.slice(0, 50));
      } else {
        const filtered = symptomsList.filter(symptom =>
          symptom.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredSymptoms(filtered);
      }
    }
  }, [searchTerm, symptomsList]);

  const checkMLHealthStatus = async () => {
      try {
        const status = await checkMLHealth();
        // Check for both "healthy" (Flask default) and "online"
        if (status.status === "healthy" || status.status === "online") {
          setMlStatus("online");
        } else {
          setMlStatus("offline");
        }
      } catch (err) {
        setMlStatus("offline");
      }
  };

  const loadSymptoms = async () => {
    setLoadingSymptoms(true);
    try {
      const response = await getSymptoms();
      if (response && response.symptoms) {
        setSymptomsList(response.symptoms);
        setFilteredSymptoms(response.symptoms.slice(0, 50));
      }
    } catch (err) {
      setError("Failed to load symptoms list.");
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
      let result;
      if (activeForm === "symptoms") {
        if (selectedSymptoms.length === 0) throw new Error("Select at least one symptom");
        result = await predictDisease(selectedSymptoms, formData);
      } else {
        result = await predictByReport({ report_data: reportData }, formData);
      }

      navigate("/result", {
        state: {
          predictions: result.predictions || (result.data ? result.data.predictions : []),
          symptoms: activeForm === "symptoms" ? selectedSymptoms : [],
          reportData: activeForm === "report" ? reportData : null,
          predictionType: activeForm,
          userData: formData
        }
      });
    } catch (err) {
        console.error("Prediction Error:", err);
        setError(err.response?.data?.message || err.message || "Prediction failed.");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { maxWidth: "700px", margin: "20px auto", padding: "20px", backgroundColor: "#ffffff", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
    title: { fontSize: "22px", color: "#333333" },
    toggleContainer: { display: "flex", backgroundColor: "#f1f3f5", borderRadius: "25px", padding: "5px", marginBottom: "25px" },
    toggleBtn: { flex: 1, padding: "10px", border: "none", borderRadius: "20px", cursor: "pointer", fontWeight: "600", transition: "0.3s" },
    activeToggle: { backgroundColor: "#007bff", color: "#ffffff" },
    inactiveToggle: { backgroundColor: "transparent", color: "#6c757d" },
    gridContainer: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" },
    formGroup: { marginBottom: "15px" },
    label: { display: "block", marginBottom: "5px", fontWeight: "600", color: "#333333", fontSize: "14px" },
    input: {
      width: "100%",
      padding: "10px",
      border: "1px solid #ced4da",
      borderRadius: "4px",
      boxSizing: "border-box",
      color: "#000000", // Fix for invisible text
      backgroundColor: "#ffffff"
    },
    symptomsContainer: { border: "1px solid #ced4da", borderRadius: "4px", padding: "10px", maxHeight: "250px", overflowY: "auto", backgroundColor: "#fff" },
    symptomsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
    symptomBtn: {
      padding: "8px",
      border: "1px solid #ced4da",
      backgroundColor: "#f8f9fa",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "13px",
      textAlign: "left",
      color: "#333333" // Fix for invisible symptom names
    },
    symptomBtnSelected: { backgroundColor: "#007bff", color: "#ffffff", borderColor: "#0056b3" },
    button: { width: "100%", padding: "14px", backgroundColor: "#28a745", color: "#ffffff", border: "none", borderRadius: "4px", fontSize: "16px", cursor: "pointer", marginTop: "20px" },
    error: { color: "#dc3545", backgroundColor: "#f8d7da", padding: "10px", borderRadius: "4px", marginTop: "15px" }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Health Analysis</h2>
        <div style={{fontSize: '14px', color: mlStatus === "online" ? "green" : "red"}}>
            {mlStatus === "online" ? "🟢 Online" : "🔴 Offline"}
        </div>
      </div>

      <div style={styles.toggleContainer}>
        <button
          type="button"
          style={{...styles.toggleBtn, ...(activeForm === "symptoms" ? styles.activeToggle : styles.inactiveToggle)}}
          onClick={() => setActiveForm("symptoms")}
        >
          Symptom Based
        </button>
        <button
          type="button"
          style={{...styles.toggleBtn, ...(activeForm === "report" ? styles.activeToggle : styles.inactiveToggle)}}
          onClick={() => setActiveForm("report")}
        >
          Blood Report Based
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={styles.gridContainer}>
            <div style={styles.formGroup}>
                <label style={styles.label}>Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.formGroup}>
                <label style={styles.label}>Blood Pressure (Sys/Dia)</label>
                <input type="text" name="bp" placeholder="120/80" value={formData.bp} onChange={handleChange} required style={styles.input} />
            </div>
        </div>

        {activeForm === "symptoms" && (
          <div className="slide-in">
             <div style={styles.formGroup}>
                <label style={styles.label}>Temperature (°F)</label>
                <input type="number" name="temperature" value={formData.temperature} onChange={handleChange} required step="0.1" style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Search & Select Symptoms</label>
              <input
                type="text"
                placeholder="Search symptoms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{...styles.input, marginBottom: '10px'}}
              />
              <div style={styles.symptomsContainer}>
                <div style={styles.symptomsGrid}>
                  {filteredSymptoms.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSymptom(s)}
                      style={{...styles.symptomBtn, ...(selectedSymptoms.includes(s) ? styles.symptomBtnSelected : {})}}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeForm === "report" && (
          <div style={styles.gridContainer}>
            {Object.keys(reportData).map((key) => (
              <div key={key} style={styles.formGroup}>
                <label style={styles.label}>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</label>
                <input
                  type="number"
                  step="0.01"
                  name={key}
                  value={reportData[key]}
                  onChange={handleReportChange}
                  style={styles.input}
                />
              </div>
            ))}
          </div>
        )}

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Processing..." : "Get Prediction"}
        </button>

        {error && <div style={styles.error}>{error}</div>}
      </form>
    </div>
  );
};

export default HealthForm;