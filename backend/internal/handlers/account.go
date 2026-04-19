package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/tkachevamaria/tula-hack/backend/internal/service"
)

type AccountHandler struct {
	service *service.AccountService
}

func NewAccountHandler(s *service.AccountService) *AccountHandler {
	return &AccountHandler{service: s}
}

func (h *AccountHandler) GetMe(c *gin.Context) {
	userID, ok := GetUserID(c)
	if !ok {
		return
	}

	user, err := h.service.GetMe(userID)
	if err != nil {
		c.JSON(404, gin.H{"error": "user not found"})
		return
	}

	c.JSON(200, gin.H{
		"id":           user.ID,
		"email":        user.Email,
		"display_name": user.DisplayName,
		"role":         user.Role,
		"bio":          user.Bio,
		"location":     user.Location,
	})
}

type UpdateMeInput struct {
	DisplayName string `json:"display_name"`
	Bio         string `json:"bio"`
	Location    string `json:"location"`
}

func (h *AccountHandler) UpdateMe(c *gin.Context) {
	userID, ok := GetUserID(c)
	if !ok {
		return
	}

	var input UpdateMeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	err := h.service.UpdateMe(
		userID,
		input.DisplayName,
		input.Bio,
		input.Location,
	)

	if err != nil {
		c.JSON(500, gin.H{"error": "failed to update"})
		return
	}

	c.JSON(200, gin.H{"message": "updated"})
}

func (h *AccountHandler) GetUserByID(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid id"})
		return
	}

	user, err := h.service.GetUserByID(id)
	if err != nil {
		c.JSON(404, gin.H{"error": "user not found"})
		return
	}

	c.JSON(200, user)
}
