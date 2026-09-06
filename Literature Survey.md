### Literature Survey 1
****
#### 1. Research Paper Used

G. Tanoori, A. Soltani, and A. Modiri, "Machine Learning for Urban Heat Island (UHI) Analysis: Predicting Land Surface Temperature (LST) in Urban Environments," _Urban Climate_, vol. 55, p. 101962, 2024, doi: 10.1016/j.uclim.2024.101962.
****
#### 2. Problem Statement
Urban Heat Island (UHI) is the phenomenon where urban areas experience significantly higher temperatures than surrounding rural or less-developed areas, primarily due to human modification of land surfaces, replacement of vegetation and soil with impervious materials such as concrete and asphalt. This effect intensifies with rapid, unplanned urbanization, increases energy demand (cooling costs), worsens air quality, and poses direct health risks during heatwaves. Land Surface Temperature (LST), derived from thermal satellite imagery, is the standard proxy used to quantify and map UHI intensity across a city.

The core problem this project addresses is two-fold: (1) accurately predicting LST at a fine spatial resolution (ward-level) using freely available satellite and ancillary data, and (2) going beyond prediction to generate actionable, ranked recommendations for urban planners, specifically, where targeted green-cover interventions would yield the greatest cooling benefit. Existing academic work solves the first half of this problem reasonably well but stops short of the second half entirely.
****
#### 3. Observations & Findings 

- The study focuses on Shiraz, Iran, and examines how urban configuration (landscape metrics) affects Land Surface Temperature (LST) across three land cover types: built-up, soil, and vegetation, using LULC and LST data from 2006 to 2021.
- Six machine learning algorithms were trained and compared for LST prediction: SVM, Decision Tree (DT), Random Forest (RF), AdaBoost, XGBoost (XGB), and Deep Neural Network (DNN). Each model used eight input features: five landscape configuration metrics (PLAND, FRAC, LSI, LPI, ED), year, and geographic coordinates (latitude/longitude).
- Model validation was carried out in two scenarios: (i) standard 5-fold cross-validation across all years, and (ii) training on 2006–2018 data and testing on unseen 2021 data (a more realistic forecasting test).
- The algorithms were compared on four evaluation metrics, which where RMSE, AAPRE%, R², CI.
- RMSE - checks accuracy of the prediction results. It measures the average difference between the predicted and actual values, indicating the model’s overall accuracy. Lower RMSE values indicate better performance.
- AAPRE%  - The Average Absolute Percent Relative Error. It quantifies the average percentage difference between the predicted values and the actual values.
- Concordance Index - It assesses the ability of the model to correctly order or rank the predicted values compared to the true values. A higher CI value indicates better predictive performance.
- R-squared - indicates the proportion of the variance in the dependent variable that can be explained by the independent variable(s) in a regression model. It is used as a measure of the goodness of fit of a regression model.
- Across both scenarios, **XGBoost and DNN consistently outperformed** the other four algorithms on all four evaluation metrics (RMSE, AAPRE%, R², CI). XGB had the edge in R² and CI which signifies best precision and ranking ability, while DNN had a lower AAPRE% in several categories which signifies best percentage accuracy.
- An uncertainty assessment using XGB Quantile Regression, Quantile Regression Forests, and a deep-learning quantile model, found that DNN produced the tightest/sharpest prediction intervals, while XGB had the fewest actual values falling outside its predicted intervals This meant that the two models are strong in different aspects of confidence estimation. RF performed worst on this measure.

- Following this, the paper ranked feature importance separately based on different land cover types, out of which, PLAND (percentage of landscape), LPI (largest patch index), ED (edge density) were the most influential metrics.
- PLAND - composition of Landscape. 
- LPI is the percentage of total landscape area occupied by the **largest single patch** of a given land-cover class.
- ED is the total length of edge (boundary) between patches of a given class and other classes, divided by the total landscape area.
- Using SHAP (Shapley Additive Explanations) values, the paper ranked feature importance separately per land cover type:
    - **Built-up areas & Soil:** PLAND > LPI > ED
    - **Vegetation:** LPI > ED > PLAND. This meant that patch size/connectivity and fragmentation mattered more than sheer proportion of vegetated area.
    - In general, higher PLAND and LPI were associated with **lower** LST (larger, more consolidated patches cool the area), while higher ED (fragmentation) was associated with **higher** LST.

- A secondary finding was the temporal LULCC trend itself: built-up area in Shiraz grew from 38% to 45.45% (2006–2021) mostly by consuming soil and vegetation cover, and average/min/max LST rose steadily over the same period, directly linking urban expansion to UHI intensification.

- **Relevance to our project:** this paper validates that XGBoost and DNN are strong choices for LST regression tasks and demonstrates a clean pipeline (landscape metrics → ML model → SHAP feature importance) that we can adapt. 
- **Gap:** This research paper mainly explains factors which explain the past LST of the region. It does not generate actionable intervention recommendations, which is a gap our project's green-cover recommendation module can address.
****
#### 4. Methodology 

**a. Study Area & Data Collection**

- Study area: Shiraz metropolitan region, Iran (hot semi-arid climate).
- LULC maps derived for five time points (2006, 2010, 2014, 2018, 2021) from Landsat imagery, classified into three categories: built-up, soil, vegetation.
- Classification accuracy validated using Kappa coefficient (92–98% across years).
- Software used: ArcGIS 10.2.1 and ENVI 5.3.1 for image processing; FRAGSTATS 4.3 for landscape metric computation; Python for data manipulation and modeling.

**b. LST Retrieval**

- LST derived from Landsat Band 10 (Thermal Infrared, TIR1), resampled from 100 m to 30 m resolution.
- Preprocessing included radiometric calibration and FLAASH atmospheric correction.
- Images sampled during July of each study year to maintain consistent seasonal/weather conditions.

**c. Landscape (Configuration) Metrics**

- Five metrics computed per land cover class using a moving-window approach in FRAGSTATS: **PLAND** (percentage of landscape), **FRAC** (fractal dimension index), **LSI** (landscape shape index), **LPI** (largest patch index), **ED** (edge density).
- Configuration maps layered with corresponding LST maps per year, preserving geographic coordinates.

**d. Data Preprocessing for ML**

- Feature vector per sample: 8 features (5 landscape metrics + year + lat/long), dataset shape N×8.
- Min-Max normalization applied to scale all features to [0,1].
- Five-number summary (min, max, median, Q1, Q3) and box plots used to inspect distribution and identify outliers via IQR.

**e. Machine Learning Models**

- Six algorithms trained per land cover category (built-up, soil, vegetation): SVM (with SVR for regression), Decision Tree, Random Forest, AdaBoost, XGBoost, and a Deep Neural Network (5 hidden layers: 128-64-32-16-1 units, L2 regularization, backpropagation).
- Hyperparameters tuned via **Random Search** (e.g., tree depth {4,8,10,16,32}, number of estimators {100–1000}, DNN learning rate {0.0005–0.01}, batch size {64,128,256}).

**f. Validation**

- **5-fold cross-validation** (Scenario 1): dataset split into 5 folds, each used once as test set; RMSE, AAPRE%, R², and CI averaged across folds.
- **Temporal holdout** (Scenario 2): trained on 2006–2018 data, tested on 2021 data to simulate real forecasting.
- Four evaluation metrics: RMSE, Concordance Index (CI), Average Absolute Percent Relative Error (AAPRE%), R-squared.

**g. Feature Importance**

- SHAP (Shapley Additive Explanations) applied on top of each trained model to rank the five landscape metrics + year by their contribution to LST predictions, separately for built-up, soil, and vegetation categories.

**h. Uncertainty Assessment**

- XGB Quantile Regression, Quantile Regression Forests, and a deep-learning quantile model used to estimate prediction intervals.
- Two metrics: **sharpness** (interval width, narrower is more confident) and **proportion of missing observations** (how often true values fall outside the predicted interval), evaluated at 60%, 70%, 80%, 90% confidence levels.

---
#### 5. Advantages in existing system
- Compares six different ML algorithms rather than relying on a single model, giving more accurate results.
- Uses SHAP for feature-level interpretability.
- ML algorithms go through an uncertainty/confidence assessment which tests their sharpness, coverage, and prediction intervals. 
- Uses two validation scenarios: A 5-fold CV, and true temporal holdout training on 2006-2018 which gets tested on data from 2021.
- High LULC classification accuracy (Kappa 92-98% across all study years).
- Analyzes LST separately per land-cover class (built-up, soil, vegetation), revealing that important factors differ by land-cover type rather than assuming one universal driver.
- Long study period (2006-2021, 15 years) captures a real urbanization trend, not just a single snapshot.
****
#### 6. Disadvantages

- Only 3 land cover classes (built-up, soil, vegetation) considered. No water class, no distinction between tree canopy and grass, no built-up density tiers.
- Uses only geometric/landscape-shape features with no actual meteorological control variables like air temperature, humidity, wind, albedo.
- Random Forest shows poor-quality, badly calibrated prediction intervals compared to XGBoost and DNN.
- DNN, despite high accuracy, is noted by the authors themselves as producing less spatially interpretable results.
- Model validated only within Shiraz, never tested on a second city or climate zone.
*****
#### 7. Limitations

- Only summer (July) imagery used across all 5 years, no seasonal or diurnal variation captured.
- Only 5 time-snapshots over 15 years (2006, 2010, 2014, 2018, 2021), coarse temporal resolution.
- No cross-city or cross-region validation, so the spatial transferability of findings is unverified.
- Stops at ranking which configuration metrics matter most (Table 4). It does not translate findings into concrete, costed intervention recommendations.
- Landsat 30m resolution cannot resolve building height directly, limiting how precisely "built-up" density can be characterized.
- Recommended future work mentions: long-term configuration changes, social factors in land-use decisions, building materials, microclimates, cost-effective interventions, vegetation type influence, and citizen-science data collection, which can contribute to making urban planning in cities to create a cooler climate.

****
#### 8. Existing System

The existing system (as represented by Tanoori et al., 2024) classifies a city's land cover into 3 broad categories, computes 5 landscape configuration metrics per category using FRAGSTATS, and feeds these metrics (along with year and coordinates) into six machine learning models to predict LST and rank feature importance via SHAP. It is a single-city (Shiraz), summer-only, geometry-only pipeline that ends at analysis. It identifies which landscape metrics matter most but does not translate this into a specific, costed action plan for planners.
***
#### 9. Proposed System

1. **Water bodies**: Can be added as a separate class using MNDWI (Modified Normalized Difference Water Index), calculated from the Green and SWIR (Short-Wave Infrared) bands available in Landsat imagery. Water bodies act as strong cooling sinks and were completely excluded from the base paper's classification.
2. **Tree canopy vs. grass/crop**: Instead of treating all vegetation as one class, NDVI is combined with a simple texture-based method: calculating the standard deviation of NDVI values within a small pixel window. Tree canopies tend to show more variation in NDVI due to shadows and gaps between leaves, while grass tends to be more uniform. This allows vegetation to be split into two more meaningful sub-classes without requiring additional data sources.
3. **Built-up density: dense v/s sparse.** Dense areas stay hotter for a longer time as compared to sparse areas. Dense areas are built with materials having high thermal mass (concrete, asphalt) which store high amount of heat energy and slowly release them in the night. In sparse areas on the other hand, due to large surface area, the heat is released faster after sunset.
***
#### 10. Our Contribution

- Base paper's 3-class LULC scheme is a genuine bottleneck for feature quality. Richer classification (adding water, tree-vs-grass, built-up density) is expected to sharpen the signal each landscape metric carries.
- The base paper's exclusion of real meteorological covariates (temperature, humidity, wind, elevation) caps its physical realism. Proposed feature set integrates ERA5/IMD reanalysis data alongside spectral indices.
- Identified the complete absence of an actionable recommendation layer in the base paper as the core gap our system is built to close, via a green-cover intervention simulator that converts model predictions into ranked, ward-level recommendations.
***
#### 11. Software Required

| Category                      | Tool / Software                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| *Operating System*            | Windows 10/11 or Ubuntu 22.04 LTS                                                                      |
| *Programming Language*        | Python 3.10+                                                                                           |
| *IDE / Notebook*              | Jupyter Notebook / JupyterLab, or VS Code with Python extension                                        |
| *Satellite Data Source*       | USGS EarthExplorer (Landsat 8/9), Copernicus Open Access Hub (Sentinel-2/3), Google Earth Engine (GEE) |
| *GIS Software*                | QGIS (free, open-source) — used in place of paid ArcGIS for LULC mapping and spatial joins             |
| *Remote Sensing Processing*   | Google Earth Engine Python API, or SNAP (Sentinel Application Platform) as an ENVI alternative         |
| *Landscape Metrics*           | pylandstats (Python FRAGSTATS-equivalent library)                                                      |
| *ML / Data Science Libraries* | scikit-learn, xgboost, pandas, numpy, matplotlib, seaborn                                              |
| *Model Explainability*        | SHAP (Shapley Additive explanations)                                                                   |
| *Uncertainty Estimation*      | mapie (conformal prediction library) or a custom conformal-prediction wrapper                          |
| *Weather / Reanalysis Data*   | ERA5-Land (Copernicus Climate Data Store) or IMD gridded data (India Meteorological Department)        |
| *Version Control*             | Git + GitHub                                                                                           |
| *Documentation / Report*      | Microsoft Word / LaTeX (Overleaf)                                                                      |
***

### Literature Survey 2
*Machine Learning Methods and Architectures for Urban Heat Island (UHI) Assessment: A Systems Review*
#### Research Paper used:
A. Gaur and C. Deb, "Machine learning methods and approaches for Urban Heat Island (UHI) assessment: A comprehensive review," _Renewable and Sustainable Energy Reviews_, vol. 234, p. 116903, July 2026. doi: 10.1016/j.rser.2026.116903.
***
#### Problem Statement
Accurate Urban Heat Island (UHI) assessment is significantly hindered by data heterogeneity and the absence of continuous, real-time monitoring. Existing methods often rely on static snapshots and inconsistent satellite products, leading to substantial error margins and a lack of actionable, micro-scale intelligence for climate-resilient urban planning.
***
#### Observations and Findings:
ML adoption in urban climatology has surged post-2017, reflecting a transition toward data-driven environmental intelligence.
A systematic analysis of the 68 core reviewed publications reveals several critical trends regarding the application of Machine Learning in urban climatology:

• **Predominance of Algorithm Types**: Ensemble Methods, led by Random Forest (RF) (24 studies), and Neural Networks (NN) (21 studies), dominate UHI literature. Their prevalence stems from their robust handling of high-dimensional, non-linear environmental datasets.
• **Primary Tasks of ML**: Applications are strictly clustered around four categories: Land Surface Temperature (LST) Retrieval and Prediction, Land Use Land Cover (LULC) Classification, UHI Intensity Pattern Modeling, and Mitigation Strategy Assessment
• **LST and Satellite Data Over-reliance:** 72% of all research linkages couple satellite-derived imagery (from Landsat, MODIS, or Sentinel) directly to LST retrieval. This over-reliance creates a critical blind spot for other climate variables (wind movement, humidity, and 3D architectural shadow patterns).
• **Unrealized Mitigation Potential**: While predictive models are highly developed (accounting for 27 studies), studies evaluating actual cooling mitigation scenarios are notably sparse (only 7 studies). There is a critical research mismatch between describing the heat problem and optimizing solutions.
***
#### Technology, Operating System, and Software Used :
Implementation necessitates GPU clusters to support computationally intensive architectures such as Swin Transformers and Spatial-Temporal Graph Nets, which are critical for capturing the multi-scalar nature of urban heat. Data sources include Landsat (TM/ETM+), MODIS, Sentinel-2, ASTER, and ECMWF. Software platforms utilized include QGIS (incorporating the MOLUSCE plugin), ArcGIS (utilizing the ArcUHI add-in), and Python-based libraries including XGBoost, TensorFlow, and Scikit-learn. Analysis focuses on critical indices such as LST, NDVI, NDBI, UTFVI, PET, and the Surface Urban Heat Island Index (SUHII).
*** 
#### Methodology Used
This review synthesizes 93 global case studies to provide a rigorous meta-analysis of algorithmic efficacy in urban climatology.
#### _Methodological Workflow_
1. **Database Execution:** Search Scopus, ScienceDirect, and Web of Science for "Machine Learning" and "Urban Heat Island" keywords.
2. **Initial Filtering:**  Apply temporal (2001–2022) and keyword filters to 2,168 initial results.
3. **Thematic Screening:**  Partial skimming reduced the pool to 93 high-relevance articles.
4. **Core Cohort Extraction:** A final cohort of 68 articles was isolated for in-depth benchmarking of algorithmic performance.
****
#### Advantages of the System
●      **Computational Efficiency:**  The use of ANN Surrogates results in a 78% reduction in simulation time over CFD.
●      **Predictive Accuracy:**  Standalone ML models provide 14–23% accuracy improvements over linear regression.
●      **Scalability:** Multi-sensor fusion enables a 10x enhancement in spatial resolution.
***
#### Disadvantages & Limitations of the System
●      **Data Hunger:**  DL architectures perform poorly in environments lacking dense ground-truth stations.
●      **Black Box Complexity:**  The lack of transparency in deep learning hinders causal understanding for municipal policy adoption.
●      **Resource Requirements:** High-resolution 3D modeling remains GPU-intensive.
***
#### Loopholes in the Existing System

|                     |                        |                                                                                                  |
| ------------------- | ---------------------- | ------------------------------------------------------------------------------------------------ |
| **Algorithm**       | **Spatial Resolution** | **Performance Findings**                                                                         |
| **CNN**             | High (<30m)            | Superior at capturing micro-scale patterns (RMSE = 1.5°C using Landsat 8 LST at 30m resolution). |
| **RF**              | Medium (100-500m)      | Optimal for policy-focused feature importance, explaining 3D metric impacts on LST.              |
| **CNN-LSTM Hybrid** | High (10m)             | **41% better** at capturing diurnal cycles and temporal heatwave patterns.                       |
| **SVM**             | Point Data             | Outperforms deep learning in "data-poor" environments with <50 sensor stations.                  |

1. **3D Structural Gap:** Sparse integration of metrics like Building Volume, which explain 70% of LST variance.
2. **Real-Time Data Scarcity:** Less than 8% of studies incorporate real-time IoT sensor data.
3. **Equity Impacts:** Negligible focus on socioeconomic distribution of cooling resources.
***
#### Our Contribution to the System
Our primary contribution involves the comprehensive synthesis of global algorithmic benchmarks to evaluate model efficacy. Furthermore, we propose a hybridized Neural-Physical framework that bridges the gap between deep learning scalability and physical interpretability, enabling more robust micro-scale thermal assessments.
***
#### Existing and Proposed System
**The Existing System** relies predominantly on 2D static satellite data (Landsat/MODIS/Sentinel) which is processed through standard, unconstrained ML algorithms (like standalone Random Forest or basic Support Vector Machines) to output passive, retrospective Land Surface Temperature (LST) and Land Use Land Cover (LULC) maps. These models act as a 'black box' lacking physical thermodynamic laws, completely ignoring 3D city structures, dynamic airflow pathways, and real-time social equity indicators. They lack the capacity to propose adaptive, active municipal interventions.

**The Proposed System: Next-Generation Digital Twin (Physics-AI)** :
The Proposed System represents an integrated, multi-modal, and physics-informed AI system. It fuses _dynamic satellite imagery_ with **high-resolution 3D LiDAR data** (capturing Building Coverage Ratios and height variations) and real-time municipal IoT grids. Crucially, the model utilizes **Physics-Informed Neural Networks (PINNs)** that embed thermodynamic and fluid dynamic constraints (such as the Navier-Stokes equations) directly into the loss functions. It is coupled with Equity-Weighted Reinforcement Learning to optimize the spatial distribution of cooling structures (like green roofs and urban parks) to protect vulnerable demographics, and integrates seamlessly into standard municipal GIS frameworks via CityGML 3.0 Digital Twins.
●      **Predictive Accuracy:**  Standalone ML models provide 14–23% accuracy improvements over linear regression.
●      **Scalability:** Multi-sensor fusion enables a 10x enhancement in spatial resolution, downscaling thermal products to 10m.
***
#### _Disadvantages and Limitations_
●      **Data Hunger:**  DL architectures perform poorly in environments lacking dense ground-truth stations.
●      **Black Box Complexity:**  The lack of transparency in deep learning hinders "causal understanding," which is vital for municipal policy adoption.
●      **Resource Requirements:** High-resolution 3D modeling remains GPU-intensive.
***
#### _Loopholes in Existing Research_
4. **3D Structural Gap:**  There is sparse integration of 3D urban metrics (e.g., Building Volume). Source data indicates these metrics explain up to 70% of LST variance in temperate cities.
5. **Real-Time Data Scarcity:**  Less than 8% of studies incorporate real-time IoT sensor data, relying instead on static satellite snapshots.
6. **Equity Impacts:** A negligible focus on the socioeconomic distribution of cooling resources and mitigation strategies.
***

### Literature Survey 3
***
#### Title: 
S. Guha, H. Govil, A. Dey, and N. Gill, "Analytical study of land surface temperature  with NDVI and NDBI using Landsat 8 OLI and TIRS data in Florence and Naples city, Italy,"  European Journal of Remote Sensing, vol. 51, no. 1, pp. 667–678, 2018, doi:  10.1080/22797254.2018.1474494. 
***
#### Problem Statement: 
Rapid urbanization has increased the extent of built-up areas while reducing vegetation  cover, resulting in higher Land Surface Temperature (LST) and intensified Urban Heat Island  (UHI) effects. There is a need to analyze the relationship between LST, NDVI, and NDBI to  understand how land cover changes influence urban thermal conditions and to support  sustainable urban planning and environmental management. 
***
#### Proposed Solution: 
• Use Landsat 8 OLI and TIRS satellite data to estimate Land Surface Temperature  (LST). 
• Calculate NDVI and NDBI to analyze vegetation and built-up areas. 
• Perform correlation analysis between LST, NDVI, and NDBI to identify their  relationships. 
• Map Urban Heat Island (UHI) hotspots and assess ecological conditions using  UTFVI. 
• Recommend increasing green spaces and adopting sustainable urban planning  strategies to reduce urban heat and improve environmental quality. 
***
#### Observation: 
• Land Surface Temperature (LST) is highest in densely built-up and bare land areas,  indicating a strong Urban Heat Island (UHI) effect. 
• NDVI and LST have a negative correlation, meaning that areas with more vegetation  generally have lower surface temperatures. 
• NDBI and LST have a positive correlation, showing that built-up areas contribute to  higher surface temperatures. 
• Florence showed a stronger negative correlation between NDVI and LST than  Naples, indicating that vegetation has a greater cooling effect in Florence. • Naples exhibited slightly higher UHI intensity than Florence, although its coastal  location moderates temperatures to some extent. 
• Most UHI hotspots were concentrated in urbanized and industrial regions, while  parks, forests, and water bodies remained relatively cool.
• UTFVI analysis revealed that highly urbanized areas experienced poorer ecological  conditions due to elevated surface temperatures. 
• The study demonstrates that Landsat 8 OLI and TIRS data are effective for mapping  LST, vegetation, built-up areas, and UHI in urban environments. 
• The findings emphasize that increasing green spaces and reducing impervious  surfaces can help mitigate urban heat and improve environmental quality. • The study concludes that NDVI and NDBI are reliable indicators for analyzing the  relationship between land cover and urban thermal characteristics, making them  useful tools for urban planning and sustainable city development. 
***
#### Technology Used and Software Used: 

• **Remote Sensing (RS):** Used to acquire and analyze Landsat 8 satellite imagery. • Geographic Information System (GIS): Used for spatial analysis, mapping, and  visualization. 
• **Thermal Remote Sensing:** Applied to retrieve Land Surface Temperature (LST). • Spectral Indices: NDVI for vegetation analysis and NDBI for built-up area  identification. 
• **Urban Heat Island (UHI) Analysis:** Used to identify urban heat hotspots.
• **UTFVI Analysis:** Used to assess urban ecological and thermal conditions.
• **Landsat 8 OLI & TIRS:** Primary satellite data source for optical and thermal analysis. 
• **ASTER DEM:** Used to incorporate elevation information into the study.
• **ENVI 5.x:** Used for image preprocessing, NDVI, NDBI, and LST extraction.
• **ArcGIS 10.x:** Used for raster processing, spatial analysis, and map generation. 
• **Microsoft Excel:** Used for statistical analysis, correlation calculations, and result  visualization. 
***
#### Methodology Used: 

1. Data Collection: Acquired Landsat 8 OLI and TIRS satellite imagery along with  ASTER DEM data for Florence and Naples, Italy. 
2. Image Pre-processing: Performed radiometric and geometric corrections to  prepare satellite images for analysis. 
3. NDVI Calculation: Computed the Normalized Difference Vegetation Index (NDVI) to assess vegetation cover. 
4. NDBI Calculation: Computed the Normalized Difference Built-up Index (NDBI) to  identify built-up areas. 
5. LST Retrieval: Estimated Land Surface Temperature (LST) from Landsat 8 thermal  infrared (TIRS) data using brightness temperature and emissivity correction. 
6. Land Use/Land Cover (LULC) Classification: Classified the study area into  vegetation, built-up land, bare land, and water bodies.
7. Urban Heat Island (UHI) Mapping: Identified and mapped high-temperature urban  hotspot areas. 
8. Correlation Analysis: Analyzed the relationship between LST–NDVI and LST–NDBI using statistical methods. 
9. UTFVI Analysis: Calculated the Urban Thermal Field Variance Index (UTFVI) to  evaluate the ecological condition of urban areas. 
10. Result Interpretation: Compared the findings for Florence and Naples and  evaluated the impact of vegetation and built-up areas on urban surface  temperature. 
***
#### Advantages: 
o Uses free and easily accessible Landsat 8 satellite data. 
o Provides an effective method for Land Surface Temperature (LST) estimation. o Analyzes the relationship between vegetation (NDVI), built-up areas (NDBI),  and LST. 
o Helps identify Urban Heat Island (UHI) hotspots. 
o Supports urban planning and sustainable development. 
o Enables monitoring of environmental and ecological conditions using UTFVI. o The methodology is cost-effective, simple, and applicable to other cities. 
***
#### Disadvantages: 
o Uses a limited number of Landsat 8 images, so seasonal and long-term  changes are not fully analyzed. 
o 30 m spatial resolution may miss small-scale urban temperature variations. o Results rely mainly on NDVI and NDBI, while other influencing factors (e.g.,  humidity, wind, population density) are not considered. 
o No extensive ground-based temperature validation to verify the LST  estimates. 
o Correlation analysis shows relationships but does not establish cause-and effect. 
o Findings are limited to Florence and Naples, so they may not be directly  applicable to all cities. 
***
#### Loopholes : 
• Uses only a single-time or limited-period dataset, lacking long-term temporal  analysis. 
• Considers only NDVI and NDBI, while other indices (e.g., NDWI, SAVI, EVI) are not  included. 
• Does not account for meteorological factors such as air temperature, humidity,  and wind speed. 
• Limited ground-truth validation of the Land Surface Temperature (LST) results.
• The study is restricted to two cities, reducing the generalizability of the findings. • Does not apply advanced machine learning or predictive models for improved  LST estimation and Urban Heat Island analysis. 
***
#### Our Contribution: 
• Perform a multi-temporal analysis using Landsat 8 images from different  seasons and years. 
• Incorporate additional indices such as NDWI, SAVI, and EVI to improve land  cover analysis. 
• Integrate meteorological data (air temperature, humidity, rainfall, and wind  speed) for more accurate LST assessment.
***

### Literature Survey 4

#### 1. Full Paper Name (IEEE Format)

P. Prasad, C. Jeganathan, P. K. Das, I. Mukherjee, and A. Agrawal, "Evaluation and prediction of LST and LULC changes for urban heat island analysis in Mumbai using remote sensing and machine learning techniques," *Environment, Development and Sustainability*, 2026, doi: 10.1007/s10668-026-07528-6.

---

#### 2. Observations & Our Findings from the Research Paper

- The study covers a 30-year window (1994–2024, at 10-year intervals) and additionally predicts LULC and LST for 2034 — one of the few Mumbai-focused studies that combines historical trend analysis with future prediction in a single pipeline.
- Built-up area grew steadily across every decade (26% → 43% → 50% → 53% → a projected 60% by 2034), while forest cover dropped sharply between 1994 and 2004 and then largely stabilized around 33%.
- Mean LST jumped by roughly 4 °C between 1994 and 2004, but changed by less than 0.5 °C per decade afterward — meaning most of the warming had already occurred by the early 2000s, and the built-up expansion of the last two decades has not produced proportionate further heating.
- Despite continuous urban growth, Mumbai's overall UHI proportion (~29–30% of the study area) stays lower than what is typically reported for other Indian megacities, which the authors attribute to the city's coastal/peninsular geography (sea breeze effect) and the presence of a national park within city limits.
- Urban Heat Spot (UHS) area — the most extreme temperature pockets — shows a continuous and much steeper rise (1.85% in 1994 to a projected 5.21% in 2034) than overall UHI, indicating that heat is intensifying and concentrating rather than spreading uniformly.
- The built-up class consistently acts as the dominant "source" landscape and forest as the dominant "sink" landscape in the Contribution Index analysis, confirming the intuitive built-up-vs-vegetation temperature relationship quantitatively rather than just qualitatively.
- XGBoost slightly outperformed Random Forest for LST prediction (RMSE 0.87 vs. 0.93 °C; R² 0.71 vs. 0.68), which is a useful data point for model selection in similar pipelines.
- The CA-ANN LULC prediction achieved only 79% accuracy — moderate, and a real constraint on how much confidence can be placed in the 2034 LULC map that feeds into the LST prediction stage.

---

#### 3. Methodology Used (in the Research Paper)

1. **Data acquisition:** Landsat 5 TM (1994), Landsat 7 ETM+ (2004), and Landsat 8 OLI/TIRS (2014, 2024) scenes with near-zero cloud cover, sourced from USGS Earth Explorer.
2. **LST retrieval:** A five-stage thermal pipeline — DN-to-radiance conversion, brightness temperature calculation, NDVI-based proportion-of-vegetation and land surface emissivity correction, LST extraction in Kelvin, and conversion to Celsius.
3. **LULC classification:** Iso-cluster unsupervised classification into four classes (built-up, forest, water body, others), with Kappa-index accuracy assessment (0.85–0.93 across years).
4. **LULC prediction (2034):** Cellular Automata–Artificial Neural Network (CA-ANN) modeling via the MOLUSCE plugin in QGIS, using seven predictor variables (elevation, slope, aspect, and Euclidean distances to built-up, forest, roads, and water), validated by predicting 2024 and comparing against the actual 2024 map.
5. **LST prediction (2034):** Random Forest Regression and XGBoost Regression trained on eleven independent variables (urban/non-urban, averaged urban, urban agglomeration index, forest/non-forest, water, elevation, slope, aspect, distance to roads, averaged water, averaged forest), validated against actual 2024 LST before generating the 2034 forecast.
6. **UHI/UHS quantification:** Contribution Index (source vs. sink landscapes), Urban Thermal Field Variance Index (UTFVI, six ecological classes), and threshold-based UHI/UHS/non-UHI/non-UHS zoning using mean + standard deviation cutoffs.
7. **Accuracy metrics:** RMSE, R², and MAE used throughout to validate both LULC and LST predictions.

---

#### 4. Advantages of the Existing System

- Combines three distinct, complementary techniques (CA-ANN for land cover, RF and XGBoost for temperature) rather than relying on a single model, which strengthens the reliability of the 2034 forecasts.
- Uses a genuinely long observation baseline (30 years) rather than a two- or three-time-point comparison, which better captures whether trends are accelerating, decelerating, or stabilizing.
- Goes beyond simple LST mapping by adding UTFVI, Contribution Index, and UHI/UHS zoning — giving planners multiple complementary lenses (ecological comfort, source/sink attribution, and extreme-heat hotspotting) rather than a single heat map.
- Validates both the LULC and LST prediction models against real, independently prepared 2024 maps before trusting them for the 2034 forecast — a sound and reproducible validation design.
- Uses freely available, well-documented data sources (Landsat via USGS Earth Explorer, OpenStreetMap, SRTM DEM) and open/standard tools (QGIS, ArcGIS, Python), making the pipeline realistically reproducible.

---

#### 5. Disadvantages & Limitations of the Existing System

- The LULC classification uses only four broad (level-1) classes; the authors themselves note that finer-grained (level-2/level-3) classes were not attempted, which limits the granularity of source/sink attribution.
- Only daytime LST is modeled — nighttime UHI dynamics, which can behave very differently from daytime patterns, are not addressed.
- Data points are limited to four Landsat acquisitions a decade apart; short-term seasonal variation, monsoon effects, and intra-annual variability are not captured at all.
- CA-ANN LULC prediction accuracy (79%) is moderate, meaning errors in the 2034 land-cover map propagate directly into the 2034 LST prediction, compounding uncertainty.
- The model does not incorporate deep-learning temporal architectures (e.g., LSTM) that could exploit the sequential nature of the decade-wise data more effectively, as the authors themselves recommend for future work.

---

#### 6. Loopholes in the Existing System

| Loophole | Consequence |
|---|---|
| Only 4 broad LULC classes used | Cannot distinguish, e.g., slum settlements from formal high-rise built-up, though these likely have very different thermal signatures |
| No nighttime LST / air temperature data | Findings apply only to surface daytime heat; cannot speak to human thermal comfort at night when heat stress is often worse |
| 10-year interval sampling | Any short-lived heat extremes, seasonal shifts, or rapid land-cover changes between sampled years are invisible to the model |
| CA-ANN accuracy capped at 79% | Downstream LST prediction inherits and possibly amplifies this uncertainty, yet the paper reports LST RMSE without propagating LULC uncertainty into it |
| Static topographical inputs for 2034 (kept same as 2024) | Assumes zero change in elevation/slope-driven microclimate effects over a decade, which is reasonable for topography but glosses over infrastructure-driven microclimate shifts (e.g., new corridors, reclaimed land) |
| No socio-economic or population-density variables | UHI is known to correlate with population density and energy use, but these factors are absent from both the LULC and LST predictor sets |

---

#### 7. Problem Statement Defined in Detail

Rapid and largely unmanaged urban expansion in coastal megacities like Mumbai is converting natural, thermally moderating land cover (forest, wetlands, water bodies) into impervious built-up surfaces at a significant rate — built-up area has grown from 26% (1994) to 53% (2024) of the study region, with a further rise to 60% projected by 2034. This land-cover transformation elevates local land surface temperatures and produces spatially concentrated "urban heat spots," which in turn degrade human thermal comfort, increase energy demand for cooling, and stress the coastal ecological system. However, most existing UHI studies either analyze historical trends without projecting forward, or use a single predictive model without cross-validating against multiple algorithms, and few provide a granular, multi-index (UTFVI + Contribution Index + UHI/UHS threshold) assessment needed by urban planners. There is therefore a need for an integrated, validated, and future-projecting framework that can (a) reconstruct 30 years of LULC and LST change from freely available satellite data, (b) project land cover and temperature a decade ahead using validated machine learning models, and (c) translate those projections into actionable heat-vulnerability zoning that supports climate-responsive urban planning for Mumbai and similarly structured coastal cities.

---

#### 8. Our Contribution to the System

This paper, along with an earlier Mumbai-focused UHI/LULC/LST study, is treated as the validated diagnostic baseline for our project — we do not attempt to re-derive or duplicate its 30-year historical trend analysis or its decade-ahead LULC/LST forecasting. Instead, our project targets the gap both papers leave open: **translating heat-risk diagnosis into actionable, location-specific intervention guidance**. Our specific contributions are:

1. **Prescriptive output, not just diagnostic mapping.** The existing system's final deliverable is a set of descriptive indices — UHI/UHS zones, UTFVI ecological classes, and a city-wide Contribution Index — with recommendations for mitigation explicitly left to policymakers as future work. Our system closes this gap by producing a ranked, ward-wise green-cover intervention list, converting heat-risk classification into a concrete action plan.
2. **Ward-level (administrative) granularity.** The existing system operates entirely on a 30×30 m pixel grid with no tie to jurisdictional boundaries. We aggregate predicted LST and land-cover statistics to the BMC ward level, making the output directly usable by municipal planners without requiring further raster-to-jurisdiction translation on their end.
3. **Ward-level operationalization of the source/sink concept.** The existing system's Contribution Index (CI) quantifies source (built-up) vs. sink (forest/water) landscape contribution to LST at the scale of the whole city. We adapt this same source/sink logic into a per-ward imbalance score, which is then used to rank wards by intervention priority — a direct methodological extension of their CI rather than an unrelated addition.
4. **Scoped-down, single-model pipeline appropriate to a present-day tool.** The existing system necessarily runs three separate models (CA-ANN for LULC simulation, plus Random Forest and XGBoost for LST) because its objective is a 10-year-ahead forecast. Since our objective is identifying where to intervene _now_ rather than predicting land cover a decade out, we use a single Random Forest regressor trained on three spectral indices (NDVI, NDBI, MNDWI) as LST predictors — a deliberate simplification justified by the different problem being solved, not a reduced version of their approach.
5. **No compounded forecast uncertainty.** The existing system's 2034 LST prediction is built on top of a CA-ANN LULC prediction that itself achieves only 79% accuracy, so forecast error compounds across stages. By focusing on current conditions instead of a decade-ahead projection, our recommendations avoid inheriting this compounded uncertainty.
6. **Interactive, demonstrable output artifact.** Beyond a static report or table, our system renders the ranked ward data as an interactive, color-coded choropleth map (priority tier per ward, with per-ward LST, land-cover composition, and recommended intervention shown on click/hover) — giving planners a directly explorable tool rather than only a printed classification.
7. **Cross-validation against the existing system's findings.** Where possible, our top-priority wards are checked against the UHS/UHI hotspot zones already identified in the existing literature (including this paper's central-and-southern-Mumbai UHS concentration) as an external sanity check on our ranking methodology, rather than validating our system in isolation.
---

#### 9. Existing and Proposed System (in Detail, with Block Diagram)

##### 9.1 Existing System (as per this paper)

The existing system follows a three-stage pipeline:

**Stage 1 — Historical LULC & LST Reconstruction**
```
 Landsat 5/7/8 imagery (1994, 2004, 2014, 2024)
              │
              ▼
   Pre-processing (radiometric correction,
   resampling to 30×30 m grid)
              │
              ▼
   ┌─────────────────────┬─────────────────────┐
   │                     │                     
   ▼                     ▼
LULC Classification   LST Retrieval
(Iso-cluster           (DN → Radiance → Brightness
unsupervised;          Temp → Emissivity correction
4 classes)             → LST in °C)
   │                     │
   ▼                     ▼
Accuracy Assessment   Validated LST maps
(Kappa Index)         (1994–2024)
```

**Stage 2 — Future LULC Prediction**
```
LULC maps (2004, 2014) + 7 predictor variables
(elevation, slope, aspect, distance to built-up/
forest/road/water)
              │
              ▼
   Cellular Automata – Artificial Neural
   Network (CA-ANN) via MOLUSCE (QGIS)
              │
              ▼
   Validate against actual 2024 LULC map
              │
              ▼
   Predicted LULC map — 2034 (79% accuracy)
```

**Stage 3 — Future LST Prediction & UHI Analysis**
```
Predicted 2034 LULC + 11 conditioning variables
              │
              ▼
   ┌─────────────────┬─────────────────┐
   ▼                 ▼
Random Forest     XGBoost
Regression        Regression
   │                 │
   └───────┬─────────┘
           ▼
   Validate against actual 2024 LST
           ▼
   Predicted LST map — 2034
           │
           ▼
   UHI / UHS zoning, UTFVI, Contribution Index
           │
           ▼
   Heat-vulnerability output for urban planners
```

##### 9.2 Proposed System (generic extension direction)

A proposed extension would retain the same validated three-stage backbone but close the gaps identified in Section 6:

```
 Landsat/Sentinel imagery + finer LULC classes
 (level-2/3: slum vs. formal built-up, dense vs.
 sparse vegetation, etc.)
              │
              ▼
   LULC classification (higher-resolution classes)
   + LST retrieval (day AND night thermal bands)
              │
              ▼
   Prediction layer: CA-ANN / LSTM for LULC
   (sequence-aware, using all 4 historical time
   points instead of only the last two)
              │
              ▼
   LST prediction: RF + XGBoost + optional deep
   model, now also conditioned on population
   density / built-form intensity where available
              │
              ▼
   Multi-index heat-vulnerability output
   (UTFVI + Contribution Index + UHI/UHS)
   presented as a ranked, ward-level or
   neighborhood-level intervention priority list
```

---

#### 10. Technology Used, Operating System, and Software to be Used

**Technology / Techniques used in the paper:**
- Remote sensing (Landsat TM/ETM+/OLI-TIRS thermal and optical bands)
- Machine learning: Random Forest Regression, XGBoost Regression
- Cellular Automata – Artificial Neural Network (CA-ANN) for land-cover simulation
- GIS-based spatial analysis (Euclidean distance mapping, zonal statistics)

**Operating System:** Any OS capable of running QGIS, ArcGIS, and Python (the paper itself does not mandate a specific OS; Windows is most common for ArcGIS, while QGIS and Python are cross-platform on Windows/Linux/macOS).

**Software / Tools used:**
- QGIS (open-source) — with the Semi-Automatic Classification plugin and the MOLUSCE plugin for CA-ANN simulation
- ArcGIS — for Euclidean distance mapping and some spatial processing
- Python — for machine learning model implementation (Random Forest, XGBoost) and accuracy metric computation

**Data sources to download:**
- USGS Earth Explorer (https://earthexplorer.usgs.gov/) — Landsat 5/7/8 imagery
- OpenStreetMap (OSM) — road, built-up, and water body vector layers
- SRTM DEM — elevation, slope, and aspect data
