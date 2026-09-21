const GEOJSON_FILE =
  "data/Bengaluru_wards_LST_NDVI_NDBI_NDWI_2026_04_25.geojson";

const RESULTS_FILE = "data/results.json";

const map = L.map("map", { zoomControl: true, scrollWheelZoom: false }).setView([12.9716, 77.5946], 10.7);

map.getContainer().addEventListener("click", () => { map.scrollWheelZoom.enable(); });
map.getContainer().addEventListener("mouseleave", () => { map.scrollWheelZoom.disable(); });

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let wardsLayer;
let wardData;
let selectedIndicator = "LST_mean_C";

const indicatorTitles = {
  LST_mean_C: "Mean Land Surface Temperature (°C)",
  NDVI_mean: "Mean NDVI",
  NDBI_mean: "Mean NDBI",
  NDWI_mean: "Mean NDWI"
};

function numeric(value, fallback = null) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function wardName(properties) {
  const keys = [
    "WARD_NAME",
    "ward_name",
    "Ward_Name",
    "NAME",
    "name",
    "WARD_NO",
    "ward_no",
    "Ward_No",
    "ward_id",
    "WARD_ID"
  ];

  for (const key of keys) {
    if (properties[key] !== undefined && properties[key] !== null) {
      return String(properties[key]);
    }
  }

  return "Selected ward";
}

function heatClass(lst) {
  if (lst < 38) {
    return { label: "Cool", css: "cool", description: "Lower relative surface heat for this satellite scene." };
  }

  if (lst < 41) {
    return { label: "Moderate", css: "moderate", description: "Moderate relative surface heat for this satellite scene." };
  }

  if (lst < 44) {
    return { label: "Hot", css: "hot", description: "High relative surface heat requiring local heat-mitigation attention." };
  }

  return { label: "Extreme", css: "extreme", description: "Very high relative surface heat for this satellite scene." };
}

function getColor(value, indicator) {
  if (!Number.isFinite(value)) {
    return "#bdbdbd";
  }

  if (indicator === "LST_mean_C") {
    if (value < 38) return "#ffffb2";
    if (value < 40) return "#fecc5c";
    if (value < 42) return "#fd8d3c";
    if (value < 44) return "#f03b20";
    return "#bd0026";
  }

  if (indicator === "NDVI_mean") {
    if (value < 0.15) return "#edf8e9";
    if (value < 0.25) return "#bae4b3";
    if (value < 0.35) return "#74c476";
    if (value < 0.45) return "#31a354";
    return "#006d2c";
  }

  if (indicator === "NDBI_mean") {
    if (value < -0.15) return "#f1eef6";
    if (value < -0.05) return "#d7b5d8";
    if (value < 0.05) return "#df65b0";
    if (value < 0.15) return "#ce1256";
    return "#67001f";
  }

  if (indicator === "NDWI_mean") {
    if (value < -0.20) return "#f7fbff";
    if (value < -0.10) return "#c6dbef";
    if (value < 0.00) return "#6baed6";
    if (value < 0.10) return "#3182bd";
    return "#08519c";
  }

  return "#bdbdbd";
}

function wardStyle(feature) {
  return {
    fillColor: getColor(numeric(feature.properties[selectedIndicator]), selectedIndicator),
    weight: 0.65,
    color: "#334e68",
    fillOpacity: 0.78
  };
}

function causes(properties) {
  const lst = numeric(properties.LST_mean_C);
  const ndvi = numeric(properties.NDVI_mean);
  const ndbi = numeric(properties.NDBI_mean);
  const ndwi = numeric(properties.NDWI_mean);
  const reasons = [];

  if (ndbi !== null && ndbi > 0.05) {
    reasons.push(
      "The built-up surface signal is high. In this prototype model, NDBI was the strongest predictor of ward-level LST."
    );
  }

  if (ndvi !== null && ndvi < 0.25) {
    reasons.push(
      "Vegetation signal is low, indicating less shade and evapotranspiration cooling."
    );
  }

  if (ndwi !== null && ndwi < -0.10) {
    reasons.push(
      "The low water/wetness signal indicates limited surface-moisture cooling."
    );
  }

  if (lst !== null && lst >= 42 && reasons.length === 0) {
    reasons.push(
      "The ward has high observed surface temperature relative to the city-wide daytime pattern."
    );
  }

  if (reasons.length === 0) {
    reasons.push(
      "Heat is influenced by multiple factors including land cover, building materials, roads, shade, moisture, and local urban form."
    );
  }

  return reasons;
}

function recommendations(properties) {
  const lst = numeric(properties.LST_mean_C);
  const ndvi = numeric(properties.NDVI_mean);
  const ndbi = numeric(properties.NDBI_mean);
  const ndwi = numeric(properties.NDWI_mean);

  const household = [];
  const community = [];
  const policy = [];

  if (ndvi !== null && ndvi < 0.25) {
    household.push("Plant native shade trees, shrubs, or climbers where space is available.");
    community.push("Create pocket parks, shaded school grounds, and roadside tree-canopy corridors.");
    policy.push("Prioritise ward tree-canopy targets and protect mature trees.");
  }

  if (ndbi !== null && ndbi > 0.05) {
    household.push("Use cool-roof coatings, lighter roof finishes, and insulation where feasible.");
    community.push("Add shade over parking lots and replace suitable paved areas with permeable/lighter materials.");
    policy.push("Offer incentives or standards for cool roofs, shaded parking, and reduced unshaded asphalt.");
  }

  if (ndwi !== null && ndwi < -0.10) {
    community.push("Improve rainwater-sensitive landscaping and protect local lake/wetland buffers.");
    policy.push("Protect blue-green infrastructure and improve stormwater infiltration in redevelopment.");
  }

  if (lst !== null && lst >= 42) {
    community.push("Create heat-action plans: drinking-water points, shaded waiting areas, and tree-based cooling corridors.");
    policy.push("Prioritise this ward for heat-risk audits and climate-resilient public-space investment.");
  }

  if (household.length === 0) {
    household.push("Maintain shade, reflective surfaces, cross-ventilation, and water-efficient greenery.");
  }

  if (community.length === 0) {
    community.push("Maintain green spaces and ensure new public works include shade and permeable landscaping.");
  }

  if (policy.length === 0) {
    policy.push("Monitor land-cover changes and include heat-resilience criteria in ward development plans.");
  }

  return { household, community, policy };
}

function listItems(items) {
  return items.map((item) => `<li>${item}</li>`).join("");
}

function updateHeatProfile(properties) {
  const lst = numeric(properties.LST_mean_C);
  const ndvi = numeric(properties.NDVI_mean);
  const ndbi = numeric(properties.NDBI_mean);
  const ndwi = numeric(properties.NDWI_mean);
  const pixels = numeric(properties.valid_pixels, 0);
  const category = heatClass(lst);
  const why = causes(properties);
  const actions = recommendations(properties);

  document.getElementById("heat-profile").innerHTML = `
    <p class="panel-eyebrow">${wardName(properties)}</p>
    <h3>Heat Profile</h3>
    <span class="heat-badge badge-${category.css}">${category.label} Heat</span>
    <p>${category.description}</p>

    <div class="metric-list">
      <div class="metric"><span>Observed mean LST</span><strong>${lst.toFixed(2)} °C</strong></div>
      <div class="metric"><span>Mean NDVI</span><strong>${ndvi.toFixed(4)}</strong></div>
      <div class="metric"><span>Mean NDBI</span><strong>${ndbi.toFixed(4)}</strong></div>
      <div class="metric"><span>Mean NDWI</span><strong>${ndwi.toFixed(4)}</strong></div>
      <div class="metric"><span>Valid 30 m pixels</span><strong>${pixels.toLocaleString()}</strong></div>
    </div>

    <h4>Why may it be hot?</h4>
    <ul class="reason-list">${listItems(why)}</ul>

    <h4>Recommended actions</h4>
    <p><strong>Household:</strong></p>
    <ul class="action-list">${listItems(actions.household)}</ul>

    <p><strong>Community / RWA / Campus:</strong></p>
    <ul class="action-list">${listItems(actions.community)}</ul>

    <p><strong>Policy / Planning:</strong></p>
    <ul class="action-list">${listItems(actions.policy)}</ul>
  `;
}

function addWardLayer() {
  if (wardsLayer) {
    map.removeLayer(wardsLayer);
  }

  wardsLayer = L.geoJSON(wardData, {
    style: wardStyle,
    onEachFeature(feature, layer) {
      layer.on({
        click(event) {
          updateHeatProfile(feature.properties);
          map.fitBounds(event.target.getBounds(), {
            padding: [35, 35],
            maxZoom: 13
          });
        },
        mouseover(event) {
          event.target.setStyle({
            weight: 2,
            color: "#102a43",
            fillOpacity: 0.92
          });
        },
        mouseout(event) {
          wardsLayer.resetStyle(event.target);
        }
      });

      layer.bindTooltip(wardName(feature.properties), { sticky: true });
    }
  }).addTo(map);

  map.fitBounds(wardsLayer.getBounds(), { padding: [20, 20] });
  updateLegend();
}

function updateLegend() {
  const legend = document.getElementById("legend");

  const text = {
    LST_mean_C: "LST: pale yellow = relatively cooler wards; dark red = relatively hotter wards.",
    NDVI_mean: "NDVI: light green = lower vegetation signal; dark green = higher vegetation signal.",
    NDBI_mean: "NDBI: pale colours = lower built-up signal; dark magenta = higher built-up signal.",
    NDWI_mean: "NDWI: pale blue = lower water/wetness signal; dark blue = higher water/wetness signal."
  };

  legend.textContent = `${indicatorTitles[selectedIndicator]} — ${text[selectedIndicator]}`;
}

function loadSummary() {
  fetch(RESULTS_FILE)
    .then((response) => response.json())
    .then((results) => {
      const ndwiElement = document.getElementById("mean-ndwi");

      if (results.mean_ndwi !== null && results.mean_ndwi !== undefined) {
        ndwiElement.textContent = Number(results.mean_ndwi).toFixed(4);
      }
    })
    .catch((error) => {
      console.warn("Results summary could not be loaded.", error);
    });
}

fetch(GEOJSON_FILE)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Could not load the ward GeoJSON file.");
    }
    return response.json();
  })
  .then((data) => {
    wardData = data;
    addWardLayer();
  })
  .catch((error) => {
    document.getElementById("legend").textContent =
      `${error.message} Use a local server or GitHub Pages; do not open index.html directly.`;
    console.error(error);
  });

document.getElementById("indicator").addEventListener("change", (event) => {
  selectedIndicator = event.target.value;
  addWardLayer();
});

loadSummary();