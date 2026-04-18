package handlers

import "github.com/gin-gonic/gin"

func SetPreferences(c *gin.Context) {
	c.JSON(200, gin.H{"message": "ok"})
}

func GetPreferences(c *gin.Context) {
	c.JSON(200, gin.H{})
}
