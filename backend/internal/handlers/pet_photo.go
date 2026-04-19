package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/tkachevamaria/tula-hack/backend/internal/service"
)

type PetPhotoHandler struct {
	uploadService *service.UploadService
	photoService  *service.PhotoService
}

func NewPetPhotoHandler(u *service.UploadService, p *service.PhotoService) *PetPhotoHandler {
	return &PetPhotoHandler{
		uploadService: u,
		photoService:  p,
	}
}

func (h *PetPhotoHandler) UploadPetPhoto(c *gin.Context) {

	_, ok := GetUserID(c)
	//userID, ok := GetUserID(c)
	if !ok {
		return
	}

	petID, _ := strconv.Atoi(c.Param("id"))

	// ⚠️ тут можно позже добавить проверку что это его питомец

	fileHeader, err := c.FormFile("photo")
	if err != nil {
		c.JSON(400, gin.H{"error": "file required"})
		return
	}

	file, _ := fileHeader.Open()
	defer file.Close()

	url, err := h.uploadService.UploadImage(file, fileHeader.Filename)
	if err != nil {
		c.JSON(500, gin.H{"error": "upload failed"})
		return
	}

	err = h.photoService.AddPetPhoto(petID, url)
	if err != nil {
		c.JSON(500, gin.H{"error": "db failed"})
		return
	}

	c.JSON(200, gin.H{
		"url": url,
	})
}
