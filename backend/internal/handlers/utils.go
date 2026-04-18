package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetUserID(c *gin.Context) (int, bool) {
	idStr := c.GetHeader("X-User-ID")
	if idStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing user id"})
		return 0, false
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return 0, false
	}

	return id, true
}
