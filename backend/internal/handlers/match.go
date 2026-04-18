package handlers

import "github.com/gin-gonic/gin"

func (h *SwipeHandler) GetMatches(c *gin.Context) {
	userID, ok := GetUserID(c)
	if !ok {
		return
	}

	matches, err := h.service.GetMatches(userID)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed"})
		return
	}

	c.JSON(200, matches)
}
