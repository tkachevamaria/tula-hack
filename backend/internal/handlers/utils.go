package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetUserID(c *gin.Context) (int, bool) {
	idStr := c.GetHeader("X-User-ID")
	if idStr == "" {
		c.JSON(401, gin.H{"error": "missing X-User-ID header"})
		return 0, false
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid user id"})
		return 0, false
	}

	return id, true
}
