package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/tkachevamaria/tula-hack/backend/internal/service"
)

type SwipeHandler struct {
	service *service.SwipeService
}

func NewSwipeHandler(s *service.SwipeService) *SwipeHandler {
	return &SwipeHandler{service: s}
}

type SwipeInput struct {
	PetID  int  `json:"pet_id"`
	IsLike bool `json:"is_like"`
}

func (h *SwipeHandler) Swipe(c *gin.Context) {
	userID, ok := GetUserID(c)
	if !ok {
		return
	}

	var input SwipeInput
	c.ShouldBindJSON(&input)

	match, err := h.service.Swipe(userID, input.PetID, input.IsLike)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed"})
		return
	}

	c.JSON(200, gin.H{
		"match": match,
	})
}

type OwnerSwipeInput struct {
	UserID int  `json:"user_id"`
	PetID  int  `json:"pet_id"`
	IsLike bool `json:"is_like"`
}

func (h *SwipeHandler) OwnerSwipe(c *gin.Context) {
	ownerID, ok := GetUserID(c)
	if !ok {
		return
	}

	var input OwnerSwipeInput
	c.ShouldBindJSON(&input)

	match, err := h.service.OwnerSwipe(ownerID, input.UserID, input.PetID, input.IsLike)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed"})
		return
	}

	c.JSON(200, gin.H{
		"match": match,
	})
}
