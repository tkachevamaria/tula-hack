package handlers

import (
	"github.com/gin-gonic/gin"
	//"net/http"
)

type SwipeInput struct {
	PetID  int  `json:"pet_id"`
	IsLike bool `json:"is_like"`
}

func Swipe(c *gin.Context) {
	_, ok := GetUserID(c)
	if !ok {
		return
	}

	var input SwipeInput
	c.ShouldBindJSON(&input)

	c.JSON(200, gin.H{
		"match":   false,
		"message": "swiped",
	})
}

type OwnerSwipeInput struct {
	UserID int  `json:"user_id"`
	PetID  int  `json:"pet_id"`
	IsLike bool `json:"is_like"`
}

func OwnerSwipe(c *gin.Context) {
	_, ok := GetUserID(c)
	if !ok {
		return
	}

	var input OwnerSwipeInput
	c.ShouldBindJSON(&input)

	c.JSON(200, gin.H{
		"match": true,
	})
}
