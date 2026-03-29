package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

// Nominatim requires a valid User-Agent; browsers cannot set it, so we proxy from the API.
const nominatimUA = "HavenOps/1.0 (https://example.com/havenops; geocode proxy)"

var nominatimClient = &http.Client{Timeout: 12 * time.Second}

func (a *API) getGeocodeForward(w http.ResponseWriter, r *http.Request) {
	if userFromCtx(r.Context()) == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	q := strings.TrimSpace(r.URL.Query().Get("q"))
	if q == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "q required"})
		return
	}
	u := "https://nominatim.openstreetmap.org/search?" + url.Values{
		"format": {"json"},
		"q":      {q},
		"limit":  {"1"},
	}.Encode()
	req, err := http.NewRequestWithContext(r.Context(), http.MethodGet, u, nil)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	req.Header.Set("User-Agent", nominatimUA)
	req.Header.Set("Accept-Language", "en")
	res, err := nominatimClient.Do(req)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "geocode unavailable"})
		return
	}
	defer res.Body.Close()
	body, err := io.ReadAll(io.LimitReader(res.Body, 1<<20))
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "geocode read failed"})
		return
	}
	if res.StatusCode != http.StatusOK {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "geocode upstream error"})
		return
	}
	var raw []struct {
		Lat         string `json:"lat"`
		Lon         string `json:"lon"`
		DisplayName string `json:"display_name"`
	}
	if err := json.Unmarshal(body, &raw); err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "geocode parse failed"})
		return
	}
	if len(raw) == 0 {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "no results"})
		return
	}
	lat, err1 := strconv.ParseFloat(raw[0].Lat, 64)
	lon, err2 := strconv.ParseFloat(raw[0].Lon, 64)
	if err1 != nil || err2 != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "invalid upstream coordinates"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"lat":          lat,
		"lon":          lon,
		"display_name": raw[0].DisplayName,
	})
}

func (a *API) getGeocodeReverse(w http.ResponseWriter, r *http.Request) {
	if userFromCtx(r.Context()) == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	latStr := strings.TrimSpace(r.URL.Query().Get("lat"))
	lonStr := strings.TrimSpace(r.URL.Query().Get("lon"))
	lat, err := strconv.ParseFloat(latStr, 64)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "lat required"})
		return
	}
	lon, err := strconv.ParseFloat(lonStr, 64)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "lon required"})
		return
	}
	if !validWGS84(lat, lon) {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid coordinates"})
		return
	}
	u := "https://nominatim.openstreetmap.org/reverse?" + url.Values{
		"format": {"json"},
		"lat":    {latStr},
		"lon":    {lonStr},
	}.Encode()
	req, err := http.NewRequestWithContext(r.Context(), http.MethodGet, u, nil)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	req.Header.Set("User-Agent", nominatimUA)
	req.Header.Set("Accept-Language", "en")
	res, err := nominatimClient.Do(req)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "geocode unavailable"})
		return
	}
	defer res.Body.Close()
	body, err := io.ReadAll(io.LimitReader(res.Body, 1<<20))
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "geocode read failed"})
		return
	}
	if res.StatusCode != http.StatusOK {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "geocode upstream error"})
		return
	}
	var raw struct {
		DisplayName string `json:"display_name"`
	}
	if err := json.Unmarshal(body, &raw); err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "geocode parse failed"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"display_name": raw.DisplayName,
	})
}
