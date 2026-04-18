package handlers

import "github.com/gin-gonic/gin"

func GetMatches(c *gin.Context) {
	c.JSON(200, gin.H{
		"matches": []gin.H{},
	})
}
