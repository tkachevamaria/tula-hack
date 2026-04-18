package handlers

import "github.com/gin-gonic/gin"

func GetMessages(c *gin.Context) {
	c.JSON(200, gin.H{
		"messages": []gin.H{},
	})
}

func SendMessage(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "sent",
	})
}
