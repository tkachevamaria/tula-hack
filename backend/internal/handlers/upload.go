package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/tkachevamaria/tula-hack/backend/internal/service"
)

type UploadHandler struct {
	service *service.UploadService
}

func NewUploadHandler(s *service.UploadService) *UploadHandler {
	return &UploadHandler{service: s}
}

func (h *UploadHandler) UploadPhoto(c *gin.Context) {

	fileHeader, err := c.FormFile("photo")
	if err != nil {
		c.JSON(400, gin.H{"error": "file required"})
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to open file"})
		return
	}
	defer file.Close()

	url, err := h.service.UploadImage(file, fileHeader.Filename)
	if err != nil {
		c.JSON(500, gin.H{"error": "upload failed"})
		return
	}

	c.JSON(200, gin.H{
		"url": url,
	})
}
