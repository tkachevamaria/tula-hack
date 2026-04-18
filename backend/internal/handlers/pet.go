package handlers

import (
	"github.com/gin-gonic/gin"
	//"net/http"
)

type CreatePetInput struct {
	Name         string `json:"name"`
	Type         string `json:"type"`
	Breed        string `json:"breed"`
	Age          int    `json:"age"`
	Description  string `json:"description"`
	AdoptionMode string `json:"adoption_mode"`
}

func CreatePet(c *gin.Context) {
	userID, ok := GetUserID(c)
	if !ok {
		return
	}

	var input CreatePetInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{
		"owner_id": userID,
		"id":       1,
	})
}

func GetFeed(c *gin.Context) {
	_, ok := GetUserID(c)
	if !ok {
		return
	}

	c.JSON(200, gin.H{
		"pets": []gin.H{},
	})
}

func GetPet(c *gin.Context) {
	id := c.Param("id")

	c.JSON(200, gin.H{
		"id": id,
	})
}

func GetMyPets(c *gin.Context) {
	userID, ok := GetUserID(c)
	if !ok {
		return
	}

	c.JSON(200, gin.H{
		"owner_id": userID,
		"pets":     []gin.H{},
	})
}
