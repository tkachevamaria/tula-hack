package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetMe(c *gin.Context) {
	userID, ok := GetUserID(c)
	if !ok {
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":           userID,
		"display_name": "test",
	})
}

type UpdateProfileInput struct {
	DisplayName string `json:"display_name"`
	Bio         string `json:"bio"`
	Location    string `json:"location"`
}

func UpdateMe(c *gin.Context) {
	_, ok := GetUserID(c)
	if !ok {
		return
	}

	var input UpdateProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"message": "updated"})
}
