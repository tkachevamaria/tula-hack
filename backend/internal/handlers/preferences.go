package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/tkachevamaria/tula-hack/backend/internal/service"
)

type PreferencesHandler struct {
	service *service.PreferencesService
}

func NewPreferencesHandler(s *service.PreferencesService) *PreferencesHandler {
	return &PreferencesHandler{service: s}
}

type PreferencesInput struct {
	PreferredType     string `json:"preferred_type"`
	MinAge            int    `json:"min_age"`
	MaxAge            int    `json:"max_age"`
	PreferredBreed    string `json:"preferred_breed"`
	PreferredLocation string `json:"preferred_location"`
}

func (h *PreferencesHandler) SetPreferences(c *gin.Context) {
	userID, ok := GetUserID(c)
	if !ok {
		return
	}

	var input PreferencesInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	err := h.service.SetPreferences(
		userID,
		input.PreferredType,
		input.MinAge,
		input.MaxAge,
		input.PreferredBreed,
		input.PreferredLocation,
	)

	if err != nil {
		c.JSON(500, gin.H{"error": "failed to save preferences"})
		return
	}

	c.JSON(200, gin.H{"message": "saved"})
}

func (h *PreferencesHandler) GetPreferences(c *gin.Context) {
	userID, ok := GetUserID(c)
	if !ok {
		return
	}

	prefs, err := h.service.GetPreferences(userID)
	if err != nil {
		c.JSON(404, gin.H{"error": "not found"})
		return
	}

	c.JSON(200, prefs)
}
