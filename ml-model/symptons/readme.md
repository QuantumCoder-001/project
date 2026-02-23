# 🩺 SymptomSense AI – Disease Prediction Model

> 🧠 **AI-powered diagnostic assistance built with Python & Machine Learning.**

Welcome to **SymptomSense**, a smart health-tech project that bridges the gap between symptoms and diagnosis. By leveraging a **Random Forest** algorithm, this model analyzes user-reported symptoms to predict the most likely health conditions with clinical-grade accuracy. It’s designed to be fast, lightweight, and incredibly easy to integrate into any web application.

---

## 🔬 Model Insights

📊 **Predict with Confidence:**

* **132 Symptoms** analyzed (from itching to internal pain).
* **41 Unique Diseases** identifiable by the "brain".
* **Top 3 Results**: Don't just get one answer; see the three most likely possibilities with percentage-based confidence scores.
* **95%+ Accuracy**: Optimized training on structured medical datasets.

---

## 🛠️ Tech Stack

| Component | Technology Used |
| :--- | :--- |
| 🤖 **Algorithm** | Random Forest Classifier |
| 🐍 **Language** | Python 3.x |
| 📊 **Data Handling** | Pandas & NumPy |
| 🎓 **ML Framework** | Scikit-Learn |
| 💾 **Serialization** | Joblib |
| 🏗️ **Integration** | JSON-based feature mapping |

---

## 📋 Complete Symptom List (Features)

To ensure the model works correctly, the frontend must provide inputs matching these exact names.

<details>
<summary><b>Click to view all 132 symptoms</b></summary>

1. itching | 2. skin_rash | 3. nodal_skin_eruptions | 4. continuous_sneezing | 5. shivering | 6. chills | 7. joint_pain | 8. stomach_pain | 9. acidity | 10. ulcers_on_tongue | 11. muscle_wasting | 12. vomiting | 13. burning_micturition | 14. spotting_ urination | 15. fatigue | 16. weight_gain | 17. anxiety | 18. cold_hands_and_feets | 19. mood_swings | 20. weight_loss | 21. restlessness | 22. lethargy | 23. patches_in_throat | 24. irregular_sugar_level | 25. cough | 26. high_fever | 27. sunken_eyes | 28. breathlessness | 29. sweating | 30. dehydration | 31. indigestion | 32. headache | 33. yellowish_skin | 34. dark_urine | 35. nausea | 36. loss_of_appetite | 37. pain_behind_the_eyes | 38. back_pain | 39. constipation | 40. abdominal_pain | 41. diarrhoea | 42. mild_fever | 43. yellow_urine | 44. yellowing_of_eyes | 45. acute_liver_failure | 46. fluid_overload | 47. swelling_of_stomach | 48. swelled_lymph_nodes | 49. malaise | 50. blurred_and_distorted_vision | 51. phlegm | 52. throat_irritation | 53. redness_of_eyes | 54. sinus_pressure | 55. runny_nose | 56. congestion | 57. chest_pain | 58. weakness_in_limbs | 59. fast_heart_rate | 60. pain_during_bowel_movements | 61. pain_in_anal_region | 62. bloody_stool | 63. irritation_in_anus | 64. neck_pain | 65. dizziness | 66. cramps | 67. bruising | 68. obesity | 69. swollen_legs | 70. swollen_blood_vessels | 71. puffy_face_and_eyes | 72. enlarged_thyroid | 73. brittle_nails | 74. swollen_extremeties | 75. excessive_hunger | 76. extra_marital_contacts | 77. drying_and_tingling_lips | 78. slurred_speech | 79. knee_pain | 80. hip_joint_pain | 81. muscle_weakness | 82. stiff_neck | 83. swelling_joints | 84. movement_stiffness | 85. spinning_movements | 86. loss_of_balance | 87. unsteadiness | 88. weakness_of_one_body_side | 89. loss_of_smell | 90. bladder_discomfort | 91. foul_smell_of urine | 92. continuous_feel_of_urine | 93. passage_of_gases | 94. internal_itching | 95. toxic_look_(typhos) | 96. depression | 97. irritability | 98. muscle_pain | 99. altered_sensorium | 100. red_spots_over_body | 101. belly_pain | 102. abnormal_menstruation | 103. dischromic _patches | 104. watering_from_eyes | 105. increased_appetite | 106. polyuria | 107. family_history | 108. mucoid_sputum | 109. rusty_sputum | 110. lack_of_concentration | 111. visual_disturbances | 112. receiving_blood_transfusion | 113. receiving_unsterile_injections | 114. coma | 115. stomach_bleeding | 116. distention_of_abdomen | 117. history_of_alcohol_consumption | 118. fluid_overload.1 | 119. blood_in_sputum | 120. prominent_veins_on_calf | 121. palpitations | 122. painful_walking | 123. pus_filled_pimples | 124. blackheads | 125. scurring | 126. skin_peeling | 127. silver_like_dusting | 128. small_dents_in_nails | 129. inflammatory_nails | 130. blister | 131. red_sore_around_nose | 132. yellow_crust_ooze

</details>

---

## 🔌 Web Developer’s Guide (Integration)

Your friend building the web app needs these **3 core files** to make the "magic" happen:

1. **`symptom_model.pkl`**: The trained intelligence.
2. **`symptom_encoder.pkl`**: Translates AI numbers into human disease names.
3. **`symptom_features.json`**: The master list of 132 symptoms.

### 💡 How to take input?

To get a prediction, the frontend should send a list of symptom names. The backend then creates a "1 and 0" list (Vector) where:

* **1** = User has this symptom.
* **0** = User does NOT have this symptom.
## 🌐 Live API Integration (For Web Developers)

The model is deployed as a live REST API on Render. You can send symptoms to it and receive the top 3 predicted diseases.

### 📍 API Endpoint
**POST** `https://symptons-api.onrender.com/predict`

**Clone My Repo**: 'https://github.com/QuantumCoder-001/symptons'

### 📥 Request Body (JSON)
The API expects a JSON object with a key named `symptoms` containing a list of symptom names.
```json
{
  "symptoms": ["itching", "skin_rash", "fatigue"]
}
clone my repo: https://github.com/QuantumCoder-001/symptons
